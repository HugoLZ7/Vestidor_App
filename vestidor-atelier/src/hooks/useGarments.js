import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as svc from '../services/garmentService'
import { friendlyError } from '../utils/errors'

const REFRESH_MS = 45 * 60 * 1000 // las URLs firmadas duran 1 h

export function useGarments() {
  const { user } = useAuth()
  const [garments, setGarments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const withUrls = useCallback(async (rows) => {
    const urls = await svc.signPaths(rows.map((r) => r.image_path))
    return rows.map((r) => ({ ...r, url: urls[r.image_path] || null }))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setGarments(await withUrls(await svc.listGarments()))
    } catch (e) {
      setError(friendlyError(e, 'No se pudieron cargar tus prendas.'))
    } finally {
      setLoading(false)
    }
  }, [withUrls])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const id = setInterval(async () => {
      try { setGarments(await withUrls(await svc.listGarments())) } catch (_) { /* reintenta luego */ }
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [withUrls])

  const add = async ({ file, category, name }) => {
    const row = await svc.uploadGarment({ userId: user.id, file, category, name })
    const [g] = await withUrls([row])
    setGarments((p) => [g, ...p])
    return g
  }
  const update = async (id, patch) => {
    const row = await svc.updateGarment(id, patch)
    setGarments((p) => p.map((g) => (g.id === id ? { ...g, ...row } : g)))
  }
  const remove = async (garment) => {
    await svc.deleteGarment(garment)
    setGarments((p) => p.filter((g) => g.id !== garment.id))
  }

  return { garments, loading, error, reload: load, add, update, remove }
}
