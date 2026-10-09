import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '../utils/nav'
import AccountActions from './AccountActions'

export default function MobileNavigation({ title }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="flex items-center gap-3 px-3 pb-1 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open}
          className="btn-grad grid h-11 w-11 place-items-center rounded-xl text-white shadow-lg shadow-rosa/20">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-semibold">{title}</h1>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-slide-up flex-col border-r border-line bg-panel p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/favicon.svg" alt="" className="h-9 w-9" />
                <span className="font-display font-semibold">Vestidor Atelier</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="rounded-lg p-2 text-mute hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            <nav className="mt-6 flex-1 space-y-1" aria-label="Principal">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium ${isActive ? 'btn-grad text-white' : 'text-mute hover:bg-line/40'}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />{label}
                </NavLink>
              ))}
            </nav>
            <div className="pb-[env(safe-area-inset-bottom)]"><AccountActions /></div>
          </div>
        </div>
      )}
    </>
  )
}
