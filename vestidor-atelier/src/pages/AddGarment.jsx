import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import { useToast } from '../components/Toast'
import { useGarments } from '../hooks/useGarments'
import { CATEGORIES } from '../utils/constants'
import { friendlyError } from '../utils/errors'
import { validateFiles } from '../utils/image'

export default function AddGarment() {
  const { add } = useGarments()
  const toast = useToast()
  const [category, setCategory] = useState('tops')
  const [name, setName] = useState('')
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), [])

  const onAdd = (files) => {
    const { valid, errors } = validateFiles(files)
    if (errors.length) toast.error(errors.join(' '))
    setItems((p) => [...p, ...valid.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), status: 'pending' }))])
  }
  const onRemove = (id) => setItems((p) => {
    const it = p.find((x) => x.id === id)
    if (it) URL.revokeObjectURL(it.preview)
    return p.filter((x) => x.id !== id)
  })

  const submit = async (e) => {
    e.preventDefault()
    if (uploading) return
    const queue = items.filter((i) => i.status !== 'done')
    if (!queue.length) return toast.error('Elige al menos una fotografía.')
    setUploading(true); setDone(0); setTotal(queue.length)
    let ok = 0
    for (const [n, it] of queue.entries()) {
      const label = name.trim() ? (queue.length > 1 ? `${name.trim()} ${n + 1}` : name.trim()) : null
      try {
        await add({ file: it.file, category, name: label })
        ok++
        setItems((p) => p.map((x) => (x.id === it.id ? { ...x, status: 'done' } : x)))
      } catch (err) {
        setItems((p) => p.map((x) => (x.id === it.id ? { ...x, status: 'error' } : x)))
        toast.error(friendlyError(err, `No se pudo subir «${it.file.name}».`))
      }
      setDone((d) => d + 1)
    }
    setUploading(false)
    if (ok) toast.success(ok === 1 ? 'Prenda guardada.' : `${ok} prendas guardadas.`)
    if (ok === queue.length) {
      setTimeout(() => { setItems((p) => { p.forEach((i) => URL.revokeObjectURL(i.preview)); return [] }); setName('') }, 900)
    }
  }

  const pending = items.filter((i) => i.status !== 'done').length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <fieldset disabled={uploading}>
        <legend className="mb-2 text-sm font-medium text-mute">Categoría</legend>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <label key={c.key} className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-sm font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-rosa ${category === c.key ? 'btn-grad border-transparent text-white' : 'border-line bg-panel text-mute hover:text-ink'}`}>
              <input type="radio" name="category" value={c.key} checked={category === c.key} onChange={() => setCategory(c.key)} className="sr-only" />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-mute">Nombre (opcional)
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} disabled={uploading}
          placeholder="Ej. Blusa blanca" className="mt-2 w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm text-ink outline-none focus:border-morado" />
        <span className="mt-1 block text-xs font-normal">Si subes varias fotos, se numerarán automáticamente.</span>
      </label>

      <ImageUploader items={items} onAdd={onAdd} onRemove={onRemove} disabled={uploading} />

      {uploading && (
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de subida">
          <div className="h-2 overflow-hidden rounded-full bg-line"><div className="btn-grad h-full transition-all" style={{ width: `${pct}%` }} /></div>
          <p className="mt-1 text-xs text-mute">Subiendo {done} de {total}…</p>
        </div>
      )}

      <button type="submit" disabled={uploading || !pending} className="btn-grad flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-white shadow-lg shadow-morado/25 transition hover:brightness-110 disabled:opacity-50">
        {uploading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Guardar prendas{pending > 0 && !uploading ? ` (${pending})` : ''}
      </button>
    </form>
  )
}
