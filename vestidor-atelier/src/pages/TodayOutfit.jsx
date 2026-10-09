import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, Heart, Loader2, Save, Shuffle, X } from 'lucide-react'
import OutfitPreview from '../components/OutfitPreview'
import GarmentCarousel from '../components/GarmentCarousel'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useGarments } from '../hooks/useGarments'
import { useOutfits } from '../hooks/useOutfits'
import { CATEGORIES, pickRandom } from '../utils/constants'
import { friendlyError } from '../utils/errors'

export default function TodayOutfit() {
  const { garments, loading, error, reload } = useGarments()
  const { add, update } = useOutfits({ autoload: false })
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [sel, setSel] = useState({ tops: null, bottoms: null, shoes: null })
  const [favorite, setFavorite] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const loadedFor = useRef(null)

  const byCat = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.key, garments.filter((g) => g.category === c.key)])),
    [garments],
  )
  const current = (cat) => byCat[cat].find((g) => g.id === sel[cat]) || byCat[cat][0] || null

  // Precarga la prenda anterior y la siguiente de cada categoría para que el cambio sea instantáneo
  useEffect(() => {
    CATEGORIES.forEach(({ key }) => {
      const list = byCat[key]
      if (list.length < 2) return
      const idx = Math.max(0, list.findIndex((g) => g.id === sel[key]))
      ;[list[(idx + 1) % list.length], list[(idx - 1 + list.length) % list.length]].forEach((g) => {
        if (g?.url) new Image().src = g.url
      })
    })
  }, [byCat, sel])

  // Recarga un outfit guardado para editarlo
  useEffect(() => {
    const o = location.state?.outfit
    if (!o || loading || loadedFor.current === o.id) return
    loadedFor.current = o.id
    const ids = { tops: o.top_garment_id, bottoms: o.bottom_garment_id, shoes: o.shoe_garment_id }
    setSel(ids)
    setFavorite(o.is_favorite)
    setEditingId(o.id)
    if (Object.values(ids).some((id) => !id || !garments.some((g) => g.id === id)))
      toast.info('Alguna prenda de este outfit ya no está disponible.')
    navigate('.', { replace: true, state: null })
  }, [location.state, loading, garments, navigate, toast])

  const move = (cat, delta) => {
    const list = byCat[cat]
    if (list.length < 2) return
    const idx = Math.max(0, list.findIndex((g) => g.id === current(cat)?.id))
    setSel((s) => ({ ...s, [cat]: list[(idx + delta + list.length) % list.length].id }))
  }
  const shuffleOne = (cat) => {
    const g = pickRandom(byCat[cat], current(cat)?.id)
    if (g) setSel((s) => ({ ...s, [cat]: g.id }))
  }
  const combine = () => {
    const next = {}
    CATEGORIES.forEach(({ key }) => { next[key] = pickRandom(byCat[key], current(key)?.id)?.id ?? null })
    setSel(next)
    if (!garments.length) toast.info('Primero agrega algunas prendas.')
  }

  const save = async () => {
    if (saving) return
    const payload = {
      top_garment_id: current('tops')?.id ?? null,
      bottom_garment_id: current('bottoms')?.id ?? null,
      shoe_garment_id: current('shoes')?.id ?? null,
      is_favorite: favorite,
    }
    if (!payload.top_garment_id && !payload.bottom_garment_id && !payload.shoe_garment_id)
      return toast.error('Elige al menos una prenda para guardar el outfit.')
    setSaving(true)
    try {
      if (editingId) { await update(editingId, payload); toast.success('Outfit actualizado.') }
      else { await add(payload); toast.success('Outfit guardado.') }
    } catch (e) { toast.error(friendlyError(e, 'No se pudo guardar el outfit.')) }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingState text="Abriendo tu vestidor…" full />
  if (error) return <EmptyState title="No pudimos cargar tu armario" text={error} actionLabel="Reintentar" onAction={reload} />

  return (
    <div className="mx-auto flex h-full min-h-[34rem] max-w-6xl flex-col gap-3">
      {editingId && (
        <div className="flex items-center justify-between rounded-xl bg-morado/15 px-3 py-2 text-sm">
          <span>Editando un outfit guardado</span>
          <button onClick={() => { setEditingId(null); setFavorite(false) }} aria-label="Dejar de editar" className="text-mute hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={combine} className="btn-grad flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl font-semibold text-white shadow-lg shadow-morado/25 transition active:scale-[.98] hover:brightness-110">
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          <span className="sm:hidden">Combinar</span><span className="hidden sm:inline">Crear outfit aleatorio</span>
        </button>
        <button onClick={() => setFavorite((f) => !f)} aria-pressed={favorite} aria-label={favorite ? 'Quitar de favoritos' : 'Marcar outfit como favorito'}
          className={`grid h-12 w-12 place-items-center rounded-2xl border transition ${favorite ? 'border-rosa bg-rosa/15 text-rosa' : 'border-line bg-panel text-mute hover:text-rosa'}`}>
          <Heart className={`h-5 w-5 ${favorite ? 'fill-rosa' : ''}`} />
        </button>
        <button onClick={() => setPreviewing(true)} aria-label="Previsualizar outfit" className="flex h-12 w-12 items-center justify-center gap-2 rounded-2xl border border-line bg-panel text-sm font-semibold transition hover:border-morado sm:w-auto sm:px-4">
          <Eye className="h-5 w-5" aria-hidden="true" /><span className="hidden sm:inline">Previsualizar</span>
        </button>
        <button onClick={save} disabled={saving} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-panel px-4 text-sm font-semibold transition hover:border-morado disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          <span className="sm:hidden">Guardar</span><span className="hidden sm:inline">Guardar outfit</span>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <GarmentCarousel key={c.key} label={c.short} items={byCat[c.key]} current={current(c.key)}
            onMove={(d) => move(c.key, d)} onRandom={() => shuffleOne(c.key)} />
        ))}
      </div>
      <OutfitPreview open={previewing} saving={saving} onClose={() => setPreviewing(false)}
        onSave={async () => { await save(); setPreviewing(false) }}
        pieces={CATEGORIES.map((c) => ({ key: c.key, label: c.short, garment: current(c.key) }))} />
    </div>
  )
}
