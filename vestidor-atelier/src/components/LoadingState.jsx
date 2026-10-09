import { Loader2 } from 'lucide-react'

export default function LoadingState({ text = 'Cargando…', full = false }) {
  return (
    <div role="status" className={`flex flex-col items-center justify-center gap-3 text-mute ${full ? 'h-full min-h-[50vh]' : 'py-16'}`}>
      <Loader2 className="h-7 w-7 animate-spin text-rosa" aria-hidden="true" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
