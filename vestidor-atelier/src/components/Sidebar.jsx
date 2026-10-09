import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NAV_ITEMS } from '../utils/nav'
import AccountActions from './AccountActions'

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`hidden shrink-0 flex-col border-r border-line bg-panel/60 p-3 transition-[width] duration-200 lg:flex ${collapsed ? 'w-[76px]' : 'w-64'}`}>
      <div className={`flex items-center gap-3 px-2 py-4 ${collapsed ? 'justify-center' : ''}`}>
        <img src="/favicon.svg" alt="" className="h-9 w-9 shrink-0" />
        {!collapsed && <span className="font-display text-lg font-semibold leading-tight">Vestidor<br /><span className="text-mute text-sm font-medium">Atelier</span></span>}
      </div>
      <nav className="mt-4 flex-1 space-y-1" aria-label="Principal">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} title={collapsed ? label : undefined} aria-label={label}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${collapsed ? 'justify-center' : ''} ${isActive ? 'btn-grad text-white shadow-lg shadow-morado/20' : 'text-mute hover:bg-line/40 hover:text-ink'}`}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
      <AccountActions compact={collapsed} />
      <button onClick={onToggle} aria-label={collapsed ? 'Expandir menú' : 'Plegar menú'} className="mt-1 flex items-center justify-center rounded-xl p-2.5 text-mute hover:bg-line/40 hover:text-ink">
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
    </aside>
  )
}
