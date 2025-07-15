import { createContext, useContext, useEffect, useState } from 'react'

type ThemeType = {
  theme: 'light' | 'dark'
  setTheme?: (theme: 'light' | 'dark') => void
  toggleTheme?: () => void
}

// Check if theme switching is enabled via env var
const THEME_SWITCH_ENABLED = import.meta.env.VITE_THEME_SWITCH_ENABLED === 'true'

const ThemeContext = createContext<ThemeType>({ theme: 'light' })

const getInitialTheme = (): ThemeType['theme'] => {
  if (!THEME_SWITCH_ENABLED) return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.body.classList.remove('sds-theme-light', 'sds-theme-dark')
    document.body.classList.add(`sds-theme-${theme}`)
  }, [theme])

  useEffect(() => {
    if (!THEME_SWITCH_ENABLED) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () => {
    if (!THEME_SWITCH_ENABLED) return

    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
