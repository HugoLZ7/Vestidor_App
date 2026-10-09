import { Shirt, LayoutGrid, Plus, Bookmark } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Outfit de hoy', icon: Shirt, end: true },
  { to: '/armario', label: 'Mi armario', icon: LayoutGrid },
  { to: '/agregar', label: 'Agregar prenda', icon: Plus },
  { to: '/outfits', label: 'Mis outfits', icon: Bookmark },
]
