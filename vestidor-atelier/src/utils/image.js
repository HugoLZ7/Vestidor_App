import { ACCEPTED_TYPES, MAX_FILE_MB } from './constants'

export function validateFiles(files) {
  const valid = []
  const errors = []
  for (const f of files) {
    if (!ACCEPTED_TYPES.includes(f.type)) errors.push(`«${f.name}» no es JPG, PNG ni WebP.`)
    else if (f.size > MAX_FILE_MB * 1024 * 1024) errors.push(`«${f.name}» pesa más de ${MAX_FILE_MB} MB.`)
    else valid.push(f)
  }
  return { valid, errors }
}

// Reduce y convierte a WebP para ahorrar almacenamiento. Si falla, sube el original.
export async function compressImage(file, max = 1600, quality = 0.85) {
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
    bmp.close?.()
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality))
    if (blob && blob.type === 'image/webp') return { blob, ext: 'webp', type: 'image/webp' }
  } catch (_) { /* usa el original */ }
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  return { blob: file, ext, type: file.type }
}
