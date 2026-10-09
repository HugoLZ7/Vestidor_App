import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNavigation from './MobileNavigation'
import { NAV_ITEMS } from '../utils/nav'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const title = NAV_ITEMS.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.label ?? 'Vestidor Atelier'

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNavigation title={title} />
        <header className="hidden px-8 pt-7 lg:block"><h1 className="font-display text-2xl font-semibold">{title}</h1></header>
        <main className="min-h-0 flex-1 overflow-y-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-5 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
