export const CATEGORIES = [
  { key: 'tops', label: 'Parte superior', short: 'Superior' },
  { key: 'bottoms', label: 'Parte inferior', short: 'Inferior' },
  { key: 'shoes', label: 'Calzado', short: 'Calzado' },
]
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]))
export const CATEGORY_SHORT = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.short]))
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_MB = 5
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
export const pickRandom = (list, avoidId) => {
  if (!list.length) return null
  const pool = list.length > 1 ? list.filter((i) => i.id !== avoidId) : list
  return pool[Math.floor(Math.random() * pool.length)]
}
