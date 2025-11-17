import { useEffect, useState } from 'react'

import { useLayout } from 'src/interfaces/layout'

export function Layout({ children }: { children: React.ReactNode }): React.ReactNode {
  const layout = useLayout()
  const [vh, setVh] = useState('100svh')

  useEffect(() => {
    // Lock body scroll
    const original = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
    }
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'

    // maintain viewport height correctly on iOS Safari
    const setHeight = () => {
      setVh(`${window.innerHeight}px`)
      setTimeout(() => {
        setVh(`${window.innerHeight}px`)
      }, 100)
    }

    setHeight()

    window.addEventListener('resize', setHeight)
    window.addEventListener('focus', setHeight)

    return () => {
      document.body.style.overflow = original.overflow
      document.body.style.position = original.position
      document.body.style.width = original.width

      window.removeEventListener('resize', setHeight)
      window.removeEventListener('focus', setHeight)
    }
  }, [])

  useEffect(() => {
    // auto scroll inputs above keyboard
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('contenteditable') === 'true'
      ) {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }, 300)
      }
    }

    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [])

  if (layout === 'mobile') {
    return (
      <div
        className="relative w-full"
        style={{
          height: vh,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <main id="app" className="absolute inset-0 flex flex-col overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="relative w-[768px] mx-auto" style={{ height: vh }}>
      <main id="app" className="absolute inset-0 flex flex-col overflow-auto scrollbar-hide">
        {children}
      </main>
    </div>
  )
}
