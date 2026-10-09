import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

export default function ImageUploader({ items, onAdd, onRemove, disabled }) {
  const input = useRef(null)
  const [drag, setDrag] = useState(false)

  const take = (list) => list?.length && onAdd(Array.from(list))

  return (
    <div>
      <div
        role="button" tabIndex={0} aria-label="Elegir fotografías"
        onClick={() => !disabled && input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), !disabled && input.current?.click())}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); !disabled && take(e.dataTransfer.files) }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed px-4 py-10 text-center transition ${drag ? 'border-rosa bg-rosa/10' : 'border-line hover:border-morado'} ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-morado/15 text-morado"><ImagePlus className="h-7 w-7" aria-hidden="true" /></span>
        <p className="font-medium">Toca para elegir fotos</p>
        <p className="text-sm text-mute">o arrástralas aquí · JPG, PNG o WebP · máx. 5 MB cada una</p>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1}
          onChange={(e) => { take(e.target.files); e.target.value = '' }} />
      </div>

      {items.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((it) => (
            <li key={it.id} className="relative aspect-square overflow-hidden rounded-xl border border-line bg-white">
              <img src={it.preview} alt={it.file.name} className="h-full w-full object-contain" />
              {it.status === 'done' && <span className="absolute inset-0 grid place-items-center bg-emerald-500/70 text-xs font-bold text-white">Listo</span>}
              {it.status === 'error' && <span className="absolute inset-x-0 bottom-0 bg-rosa/90 py-0.5 text-center text-[11px] font-semibold text-white">Falló</span>}
              {!disabled && it.status !== 'done' && (
                <button onClick={() => onRemove(it.id)} aria-label={`Quitar ${it.file.name}`} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-rosa">
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
