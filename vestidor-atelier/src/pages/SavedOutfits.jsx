import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Heart, Pencil, Trash2, ImageOff } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useGarments } from '../hooks/useGarments'
import { useOutfits } from '../hooks/useOutfits'
import { formatDate } from '../utils/constants'
import { friendlyError } from '../utils/errors'

function Piece({ garment, label }) {
  return (
    <div className="aspect-square overflow-hidden rounded-xl bg-white">
      {garment?.url ? (
        <img src={garment.url} alt={garment.name || label} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 bg-line/30 p-1 text-center text-[11px] text-mute">
          <ImageOff className="h-4 w-4" aria-hidden="true" />Prenda no disponible
        </div>
      )}
    </div>
  )
}

export default function SavedOutfits() {
  const { outfits, loading, error, reload, toggleFavorite, remove } = useOutfits()
  const { garments, loading: loadingG } = useGarments()
  const toast = useToast()
  const navigate = useNavigate()
  const [onlyFav, setOnlyFav] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const byId = useMemo(() => Object.fromEntries(garments.map((g) => [g.id, g])), [garments])
  const shown = onlyFav ? outfits.filter((o) => o.is_favorite) : outfits

  const fav = async (o) => {
    try { await toggleFavorite(o) } catch (e) { toast.error(friendlyError(e, 'No se pudo cambiar el favorito.')) }
  }
  const confirmDelete = async () => {
    setBusy(true)
    try { await remove(deleting.id); toast.success('Outfit eliminado.'); setDeleting(null) }
    catch (e) { toast.error(friendlyError(e, 'No se pudo eliminar el outfit.')) }
    finally { setBusy(false) }
  }

  if (loading || loadingG) return <LoadingState text="Cargando tus outfits…" />
  if (error) return <EmptyState title="No pudimos cargar tus outfits" text={error} actionLabel="Reintentar" onAction={reload} />
  if (!outfits.length)
    return <EmptyState icon={Bookmark} title="Aún no guardas outfits" text="Combina prendas en «Outfit de hoy» y pulsa Guardar." actionLabel="Crear un outfit" to="/" />

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <button onClick={() => setOnlyFav((v) => !v)} aria-pressed={onlyFav}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${onlyFav ? 'btn-grad text-white' : 'border border-line bg-panel text-mute hover:text-ink'}`}>
        <Heart className="h-4 w-4" aria-hidden="true" />Solo favoritos
      </button>
      {!shown.length && <EmptyState title="Sin favoritos todavía" text="Marca un outfit con el corazón para verlo aquí." />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((o) => (
          <article key={o.id} className="rounded-3xl border border-line bg-panel p-3">
            <div className="grid grid-cols-3 gap-2">
              <Piece garment={byId[o.top_garment_id]} label="Parte superior" />
              <Piece garment={byId[o.bottom_garment_id]} label="Parte inferior" />
              <Piece garment={byId[o.shoe_garment_id]} label="Calzado" />
            </div>
            <div className="mt-3 flex items-center gap-1">
              <p className="flex-1 text-sm text-mute">{o.name || 'Outfit'} · {formatDate(o.created_at)}</p>
              <button onClick={() => fav(o)} aria-pressed={o.is_favorite} aria-label={o.is_favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                className={`grid h-9 w-9 place-items-center rounded-lg hover:bg-line/50 ${o.is_favorite ? 'text-rosa' : 'text-mute'}`}>
                <Heart className={`h-4 w-4 ${o.is_favorite ? 'fill-rosa' : ''}`} />
              </button>
              <button onClick={() => navigate('/', { state: { outfit: o } })} aria-label="Cargar en el seleccionador para editar" className="grid h-9 w-9 place-items-center rounded-lg text-mute hover:bg-line/50 hover:text-ink"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => setDeleting(o)} aria-label="Eliminar outfit" className="grid h-9 w-9 place-items-center rounded-lg text-mute hover:bg-rosa/15 hover:text-rosa"><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog open={!!deleting} busy={busy} title="¿Eliminar este outfit?" message="Las prendas no se borran, solo esta combinación."
        onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </div>
  )
}
