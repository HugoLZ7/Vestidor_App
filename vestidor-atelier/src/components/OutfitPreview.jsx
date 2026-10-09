import { useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'

// Vista previa: las 3 prendas pegadas en vertical (superior, inferior, calzado), lo más grandes posible sin hacer scroll.
export default function OutfitPreview({ open, pieces, onClose, onSave, saving }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  // Alto disponible dividido en 3 celdas cuadradas; el ancho nunca supera la pantalla.
  const cell = 'min(calc((100dvh - 7.5rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)) / 3), 100vw)'

  return (
    <div role="dialog" aria-modal="true" aria-label="Vista previa del outfit"
      className="fixed inset-0 z-50 flex animate-fade-in flex-col items-center bg-bg/95 backdrop-blur-md" onClick={onClose}>
      <div className="flex w-full items-center justify-between px-4 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <h2 className="font-display text-lg font-semibold">Vista previa</h2>
        <button onClick={onClose} aria-label="Cerrar vista previa" autoFocus className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-panel hover:text-rosa"><X className="h-5 w-5" /></button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/40" style={{ width: cell }}>
          {pieces.map(({ key, label, garment }) => (
            <div key={key} className="grid place-items-center bg-white" style={{ width: cell, height: cell }}>
              {garment?.url
                ? <img src={garment.url} alt={garment.name || label} decoding="async" draggable="false" className="h-full w-full select-none object-contain" />
                : <p className="px-4 text-center text-xs text-slate-500">Sin {label.toLowerCase()}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={onSave} disabled={saving} className="btn-grad mx-auto flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-2xl font-semibold text-white shadow-lg shadow-morado/25 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}Guardar outfit
        </button>
      </div>
    </div>
  )
}
