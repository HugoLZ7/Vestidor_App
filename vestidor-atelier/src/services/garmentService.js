import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/image'

const BUCKET = 'garments'

export async function listGarments() {
  const { data, error } = await supabase.from('garments').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Las URLs firmadas se guardan en localStorage y se reutilizan: así la URL no cambia entre visitas
// y el navegador puede servir las fotos desde su caché en lugar de descargarlas otra vez.
const CACHE_KEY = 'atelier-url-cache'
const TTL = 7 * 24 * 3600 // 7 días
const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {} } catch (_) { return {} } }
export const clearUrlCache = () => { try { localStorage.removeItem(CACHE_KEY) } catch (_) { /* nada */ } }

export async function signPaths(paths) {
  if (!paths.length) return {}
  const now = Date.now() / 1000
  const cache = readCache()
  const result = {}
  const missing = []
  for (const p of paths) {
    const c = cache[p]
    if (c && c.exp - now > 86400) result[p] = c.url
    else missing.push(p)
  }
  if (missing.length) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(missing, TTL)
    if (error) throw error
    for (const d of data) {
      if (d.signedUrl) { result[d.path] = d.signedUrl; cache[d.path] = { url: d.signedUrl, exp: now + TTL } }
    }
    for (const k of Object.keys(cache)) if (cache[k].exp < now) delete cache[k]
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch (_) { /* sin espacio */ }
  }
  return result
}

export async function uploadGarment({ userId, file, category, name }) {
  const { blob, ext, type } = await compressImage(file)
  const path = `${userId}/garments/${crypto.randomUUID()}.${ext}`
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: false })
  if (upErr) throw upErr
  const { data, error } = await supabase
    .from('garments')
    .insert({ user_id: userId, name: name || null, category, image_path: path })
    .select()
    .single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]) // evita archivos huérfanos
    throw error
  }
  return data
}

export async function updateGarment(id, patch) {
  const { data, error } = await supabase.from('garments').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Primero la fila (los outfits quedan con NULL por ON DELETE SET NULL), luego el archivo.
export async function deleteGarment(garment) {
  const { error } = await supabase.from('garments').delete().eq('id', garment.id)
  if (error) throw error
  const { error: fileErr } = await supabase.storage.from(BUCKET).remove([garment.image_path])
  if (fileErr) console.warn('No se pudo borrar el archivo', fileErr)
}
