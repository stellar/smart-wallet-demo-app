import { createContext, useContext, useEffect, useState } from 'react'

type ThemeType = {
  theme: 'light' | 'dark'
  setTheme?: (theme: 'light' | 'dark') => void
  toggleTheme?: () => void
}

const ThemeContext = createContext<ThemeType>({ theme: 'light' })

const getInitialTheme = (): ThemeType['theme'] => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  // On theme change, update the body class
  useEffect(() => {
    document.body.classList.remove('sds-theme-light', 'sds-theme-dark')
    // document.body.classList.add(`sds-theme-${theme}`)
    document.body.classList.add(`sds-theme-light`)
  }, [theme])

  // Optional: Sync with OS preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
