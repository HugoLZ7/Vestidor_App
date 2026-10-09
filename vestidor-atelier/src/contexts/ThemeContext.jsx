import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('atelier-theme') || 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#FAF6FF' : '#14111F')
    localStorage.setItem('atelier-theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
