import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as svc from '../services/garmentService'
import { friendlyError } from '../utils/errors'

const REFRESH_MS = 60 * 60 * 1000
let memoryCache = null // se conserva entre páginas: la lista aparece al instante

export function useGarments() {
  const { user } = useAuth()
  const [garments, setGarments] = useState(memoryCache || [])
  const [loading, setLoading] = useState(!memoryCache)
  const [error, setError] = useState(null)

  const withUrls = useCallback(async (rows) => {
    const urls = await svc.signPaths(rows.map((r) => r.image_path))
    return rows.map((r) => ({ ...r, url: urls[r.image_path] || null }))
  }, [])

  const load = useCallback(async () => {
    if (!memoryCache) setLoading(true)
    setError(null)
    try {
      const rows = await withUrls(await svc.listGarments())
      memoryCache = rows
      setGarments(rows)
    } catch (e) {
      setError(friendlyError(e, 'No se pudieron cargar tus prendas.'))
    } finally {
      setLoading(false)
    }
  }, [withUrls])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const id = setInterval(async () => {
      try { const rows = await withUrls(await svc.listGarments()); memoryCache = rows; setGarments(rows) } catch (_) { /* reintenta luego */ }
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [withUrls])

  const add = async ({ file, category, name }) => {
    const row = await svc.uploadGarment({ userId: user.id, file, category, name })
    const [g] = await withUrls([row])
    setGarments((p) => (memoryCache = [g, ...p]))
    return g
  }
  const update = async (id, patch) => {
    const row = await svc.updateGarment(id, patch)
    setGarments((p) => (memoryCache = p.map((g) => (g.id === id ? { ...g, ...row } : g))))
  }
  const remove = async (garment) => {
    await svc.deleteGarment(garment)
    setGarments((p) => (memoryCache = p.filter((g) => g.id !== garment.id)))
  }

  return { garments, loading, error, reload: load, add, update, remove }
}
