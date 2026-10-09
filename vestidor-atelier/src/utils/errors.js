// Traduce errores técnicos de Supabase/red a mensajes comprensibles en español.
export function friendlyError(err, fallback = 'Ocurrió un problema. Inténtalo de nuevo.') {
  const msg = (err?.message || String(err || '')).toLowerCase()
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'Sin conexión a internet. Revísala e inténtalo otra vez.'
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('load failed'))
    return 'No se pudo conectar con el servidor. Revisa tu internet e inténtalo otra vez.'
  if (msg.includes('invalid login')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('email not confirmed')) return 'Tu correo aún no está confirmado.'
  if (msg.includes('jwt') || msg.includes('expired')) return 'Tu sesión venció. Vuelve a iniciar sesión.'
  if (msg.includes('row-level security') || msg.includes('permission') || err?.status === 403)
    return 'No tienes permiso para realizar esta acción.'
  if (msg.includes('payload too large') || msg.includes('maximum allowed size')) return 'El archivo es demasiado grande.'
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Demasiados intentos. Espera un momento.'
  if (msg.includes('bucket not found')) return 'El almacenamiento de fotos aún no está configurado.'
  return fallback
}
