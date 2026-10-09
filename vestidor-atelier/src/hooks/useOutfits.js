import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as svc from '../services/outfitService'
import { friendlyError } from '../utils/errors'

export function useOutfits({ autoload = true } = {}) {
  const { user } = useAuth()
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(autoload)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOutfits(await svc.listOutfits())
    } catch (e) {
      setError(friendlyError(e, 'No se pudieron cargar tus outfits.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (autoload) load() }, [autoload, load])

  const add = async (payload) => {
    const row = await svc.createOutfit(user.id, payload)
    setOutfits((p) => [row, ...p])
    return row
  }
  const update = async (id, patch) => {
    const row = await svc.updateOutfit(id, patch)
    setOutfits((p) => p.map((o) => (o.id === id ? row : o)))
    return row
  }
  const toggleFavorite = (outfit) => update(outfit.id, { is_favorite: !outfit.is_favorite })
  const remove = async (id) => {
    await svc.deleteOutfit(id)
    setOutfits((p) => p.filter((o) => o.id !== id))
  }

  return { outfits, loading, error, reload: load, add, update, toggleFavorite, remove }
}
