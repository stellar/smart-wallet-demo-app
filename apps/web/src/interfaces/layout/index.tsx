import { createContext, useContext, useEffect, useState } from 'react'

export type LayoutType = 'mobile' | 'desktop'

const LayoutContext = createContext<LayoutType>('mobile')

export const useLayout = () => useContext(LayoutContext)

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [layout, setLayout] = useState<LayoutType>(() => {
    if (typeof window === 'undefined') return 'mobile'
    return window.innerWidth < 768 ? 'mobile' : 'desktop'
  })

  useEffect(() => {
    const onResize = () => {
      setLayout(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>
}
