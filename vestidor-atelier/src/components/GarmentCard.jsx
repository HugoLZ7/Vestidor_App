import { Pencil, Trash2 } from 'lucide-react'
import { CATEGORY_SHORT } from '../utils/constants'

export default function GarmentCard({ garment, onEdit, onDelete }) {
  const label = garment.name || 'Sin nombre'
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-panel transition hover:-translate-y-0.5 hover:border-morado/60 hover:shadow-lg hover:shadow-morado/10">
      <div className="aspect-square bg-white">
        {garment.url && <img src={garment.url} alt={label} loading="lazy" className="h-full w-full object-contain" />}
      </div>
      <div className="flex items-center gap-1 p-2.5 pl-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-mute">{CATEGORY_SHORT[garment.category]}</p>
        </div>
        <button onClick={() => onEdit(garment)} aria-label={`Editar ${label}`} className="grid h-9 w-9 place-items-center rounded-lg text-mute hover:bg-line/50 hover:text-ink"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => onDelete(garment)} aria-label={`Eliminar ${label}`} className="grid h-9 w-9 place-items-center rounded-lg text-mute hover:bg-rosa/15 hover:text-rosa"><Trash2 className="h-4 w-4" /></button>
      </div>
    </article>
  )
}
