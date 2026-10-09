import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/image'

const BUCKET = 'garments'

export async function listGarments() {
  const { data, error } = await supabase.from('garments').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function signPaths(paths, expires = 3600) {
  if (!paths.length) return {}
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, expires)
  if (error) throw error
  return Object.fromEntries(data.filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]))
}

export async function uploadGarment({ userId, file, category, name }) {
  const { blob, ext, type } = await compressImage(file)
  const path = `${userId}/garments/${crypto.randomUUID()}.${ext}`
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: type, cacheControl: '3600', upsert: false })
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
