import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', busy = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => !busy && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-fade-in rounded-3xl border border-line bg-panel p-6 shadow-2xl">
        <h2 id="confirm-title" className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-mute">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} disabled={busy} className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-line/40">Cancelar</button>
          <button onClick={onConfirm} disabled={busy} className="flex items-center gap-2 rounded-xl bg-rosa px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
