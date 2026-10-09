import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

const STYLES = {
  success: { icon: CheckCircle2, color: 'text-emerald-400' },
  error: { icon: AlertTriangle, color: 'text-rosa' },
  info: { icon: Info, color: 'text-morado' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const push = useCallback((type, message) => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t.slice(-2), { id, type, message }])
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500)
  }, [dismiss])

  const api = useMemo(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m) }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        {toasts.map((t) => {
          const { icon: Icon, color } = STYLES[t.type]
          return (
            <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl border border-line bg-panel p-3 text-sm shadow-xl shadow-black/30">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
              <p className="flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Cerrar notificación" className="text-mute hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
