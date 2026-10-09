import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import EmptyState from './EmptyState'

export default function GarmentCarousel({ label, items, current, onMove, onRandom }) {
  const touchX = useRef(null)
  const count = items.length
  const position = current ? items.findIndex((g) => g.id === current.id) + 1 : 0

  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 45) onMove(dx < 0 ? 1 : -1)
  }

  const arrow = 'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-line/40 text-ink transition hover:bg-morado/40 active:scale-95 disabled:pointer-events-none disabled:opacity-30'

  return (
    <section aria-label={label} className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-panel p-3 shadow-lg shadow-black/10">
      <header className="mb-2 flex items-center gap-2">
        <span className="rounded-lg bg-morado/25 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-morado">{label}</span>
        <span className="text-sm text-mute">{count} {count === 1 ? 'prenda' : 'prendas'}</span>
        {count > 1 && <span className="text-xs text-mute/70">· {position}/{count}</span>}
        <button onClick={onRandom} disabled={count < 2} aria-label={`Prenda aleatoria de ${label}`}
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-mute transition hover:bg-line/50 hover:text-rosa disabled:opacity-30">
          <Shuffle className="h-4 w-4" />
        </button>
      </header>

      {current ? (
        <div className="flex min-h-0 flex-1 items-center gap-2">
          <button className={arrow} onClick={() => onMove(-1)} disabled={count < 2} aria-label={`${label}: prenda anterior`}><ChevronLeft className="h-5 w-5" /></button>
          <div className="flex h-full min-w-0 flex-1 items-center justify-center" onTouchStart={(e) => (touchX.current = e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
            <div className="h-full max-w-full aspect-square overflow-hidden rounded-2xl bg-white">
              <img key={current.id} src={current.url} alt={current.name || label} draggable="false" className="h-full w-full animate-fade-in select-none object-contain" />
            </div>
          </div>
          <button className={arrow} onClick={() => onMove(1)} disabled={count < 2} aria-label={`${label}: prenda siguiente`}><ChevronRight className="h-5 w-5" /></button>
        </div>
      ) : (
        <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-line">
          <EmptyState compact title="Aún no hay prendas" text="Agrega una foto para verla aquí." actionLabel="Agregar prenda" to="/agregar" />
        </div>
      )}
    </section>
  )
}
