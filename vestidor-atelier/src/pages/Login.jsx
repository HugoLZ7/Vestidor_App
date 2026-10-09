import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { friendlyError } from '../utils/errors'

export default function Login() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (session) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!email.trim() || !password) return setError('Escribe tu correo y tu contraseña.')
    setBusy(true)
    setError('')
    try { await signIn(email.trim(), password) } catch (err) { setError(friendlyError(err, 'No se pudo iniciar sesión.')) }
    finally { setBusy(false) }
  }
  const field = 'mt-1.5 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-morado'

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-bg p-4">
      <form onSubmit={submit} noValidate className="w-full max-w-sm animate-fade-in rounded-3xl border border-line bg-panel p-7 shadow-2xl shadow-morado/10">
        <img src="/favicon.svg" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-4 text-center font-display text-2xl font-semibold">Vestidor Atelier</h1>
        <p className="mt-1 text-center text-sm text-mute">Inicia sesión para ver tu armario</p>
        <label className="mt-6 block text-sm text-mute">Correo
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <label className="mt-3 block text-sm text-mute">Contraseña
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </label>
        {error && <p role="alert" className="mt-3 rounded-xl bg-rosa/10 px-3 py-2 text-sm text-rosa">{error}</p>}
        <button type="submit" disabled={busy} className="btn-grad mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Entrar
        </button>
      </form>
    </main>
  )
}
