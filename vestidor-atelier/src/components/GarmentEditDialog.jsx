import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { CATEGORIES } from '../utils/constants'

export default function GarmentEditDialog({ garment, busy, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('tops')

  useEffect(() => {
    if (!garment) return
    setName(garment.name || '')
    setCategory(garment.category)
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [garment, busy, onCancel])

  if (!garment) return null
  const field = 'mt-1.5 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-morado'
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => !busy && onCancel()}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave({ name: name.trim() || null, category }) }}
        role="dialog" aria-modal="true" aria-labelledby="edit-title" className="w-full max-w-sm animate-fade-in rounded-3xl border border-line bg-panel p-6 shadow-2xl">
        <h2 id="edit-title" className="font-display text-lg font-semibold">Editar prenda</h2>
        <div className="mx-auto mt-4 aspect-square w-28 overflow-hidden rounded-xl bg-white"><img src={garment.url} alt="" className="h-full w-full object-contain" /></div>
        <label className="mt-4 block text-sm text-mute">Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Opcional" className={field} autoFocus />
        </label>
        <label className="mt-3 block text-sm text-mute">Categoría
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-line/40">Cancelar</button>
          <button type="submit" disabled={busy} className="btn-grad flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}
