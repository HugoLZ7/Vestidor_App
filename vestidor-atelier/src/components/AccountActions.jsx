import { Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

export default function AccountActions({ compact = false }) {
  const { theme, toggle } = useTheme()
  const { signOut } = useAuth()
  const base = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mute transition hover:bg-line/40 hover:text-ink ${compact ? 'justify-center' : ''}`
  return (
    <div className="space-y-1">
      <button onClick={toggle} className={base} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        {!compact && <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>}
      </button>
      <button onClick={signOut} className={`${base} w-full`} aria-label="Cerrar sesión">
        <LogOut className="h-5 w-5" />
        {!compact && <span>Cerrar sesión</span>}
      </button>
    </div>
  )
}
