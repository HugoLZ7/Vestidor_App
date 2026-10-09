import { useMemo, useState } from 'react'
import { Search, Shirt } from 'lucide-react'
import GarmentCard from '../components/GarmentCard'
import GarmentEditDialog from '../components/GarmentEditDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useGarments } from '../hooks/useGarments'
import { CATEGORIES } from '../utils/constants'
import { friendlyError } from '../utils/errors'

export default function Wardrobe() {
  const { garments, loading, error, reload, update, remove } = useGarments()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState('desc')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return garments
      .filter((g) => (filter === 'all' || g.category === filter) && (!q || (g.name || '').toLowerCase().includes(q)))
      .sort((a, b) => (order === 'desc' ? 1 : -1) * (new Date(b.created_at) - new Date(a.created_at)))
  }, [garments, filter, query, order])

  const run = async (fn, okMsg, failMsg, done) => {
    if (busy) return
    setBusy(true)
    try { await fn(); toast.success(okMsg); done() } catch (e) { toast.error(friendlyError(e, failMsg)) } finally { setBusy(false) }
  }

  if (loading) return <LoadingState text="Cargando tu armario…" />
  if (error) return <EmptyState title="No pudimos cargar tu armario" text={error} actionLabel="Reintentar" onAction={reload} />
  if (!garments.length)
    return <EmptyState icon={Shirt} title="Tu armario está vacío" text="Sube las primeras fotos de tu ropa para empezar a combinarla." actionLabel="Agregar prenda" to="/agregar" />

  const chip = (active) => `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'btn-grad text-white' : 'border border-line bg-panel text-mute hover:text-ink'}`
  const groups = filter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.key === filter)

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar por nombre</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre"
            className="w-full rounded-xl border border-line bg-panel py-2.5 pl-10 pr-3 text-sm outline-none focus:border-morado" />
        </label>
        <label>
          <span className="sr-only">Ordenar</span>
          <select value={order} onChange={(e) => setOrder(e.target.value)} className="w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-morado sm:w-auto">
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguas primero</option>
          </select>
        </label>
      </div>
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Filtrar por categoría">
        <button className={chip(filter === 'all')} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Todas ({garments.length})</button>
        {CATEGORIES.map((c) => (
          <button key={c.key} className={chip(filter === c.key)} aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>
            {c.label} ({garments.filter((g) => g.category === c.key).length})
          </button>
        ))}
      </div>

      {!visible.length && <EmptyState title="Sin resultados" text="Prueba con otro nombre o categoría." />}
      {groups.map((c) => {
        const list = visible.filter((g) => g.category === c.key)
        if (!list.length) return null
        return (
          <section key={c.key} aria-label={c.label}>
            <h2 className="mb-3 font-display text-lg font-semibold">{c.label} <span className="text-sm font-normal text-mute">({list.length})</span></h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {list.map((g) => <GarmentCard key={g.id} garment={g} onEdit={setEditing} onDelete={setDeleting} />)}
            </div>
          </section>
        )
      })}

      <GarmentEditDialog garment={editing} busy={busy} onCancel={() => setEditing(null)}
        onSave={(patch) => run(() => update(editing.id, patch), 'Prenda actualizada.', 'No se pudo actualizar la prenda.', () => setEditing(null))} />
      <ConfirmDialog open={!!deleting} busy={busy} title="¿Eliminar esta prenda?"
        message="Se borrará su foto. Los outfits guardados que la usan se conservarán, pero quedarán sin esta prenda."
        onCancel={() => setDeleting(null)}
        onConfirm={() => run(() => remove(deleting), 'Prenda eliminada.', 'No se pudo eliminar la prenda.', () => setDeleting(null))} />
    </div>
  )
}
