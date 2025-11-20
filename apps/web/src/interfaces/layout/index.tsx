import { useEffect, useRef } from 'react'

import { useLayoutStore } from 'src/store/layout'

export type LayoutType = 'mobile' | 'desktop'

export const useLayout = () => useLayoutStore(state => state.layout)

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const setLayout = useLayoutStore(state => state.setLayout)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Initialize layout based on current window width (only once)
    if (!hasInitialized.current && typeof window !== 'undefined') {
      const initialLayout = window.innerWidth < 768 ? 'mobile' : 'desktop'
      setLayout(initialLayout)
      hasInitialized.current = true
    }

    // Update layout on window resize
    const onResize = () => {
      if (typeof window !== 'undefined') {
        setLayout(window.innerWidth < 768 ? 'mobile' : 'desktop')
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setLayout])

  return <>{children}</>
}
