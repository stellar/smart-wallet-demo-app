import { Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
  title?: string
  className?: string
  style?: React.CSSProperties
  centerMode?: boolean
  onCarouselChange?: (index: number) => void
  showIndicators?: boolean
}

export const Carousel = ({
  children,
  title,
  className,
  style,
  centerMode,
  onCarouselChange,
  showIndicators = false,
}: Props): React.ReactNode => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [sidePadding, setSidePadding] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentIndexRef = useRef<number>(0)
  const childrenArray = Array.isArray(children) ? children : [children]

  // Handle scroll tracking
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let rafId: number | null = null

    const updateIndexBasedOnCenter = () => {
      const childrenEls = Array.from(container.children) as HTMLElement[]
      if (childrenEls.length === 0) return

      const containerRect = container.getBoundingClientRect()
      const containerCenterX = containerRect.left + containerRect.width / 2

      let minDistance = Infinity
      let nearestIndex = 0

      childrenEls.forEach((child, idx) => {
        const rect = child.getBoundingClientRect()
        const childCenterX = rect.left + rect.width / 2
        const distance = Math.abs(childCenterX - containerCenterX)
        if (distance < minDistance) {
          minDistance = distance
          nearestIndex = idx
        }
      })

      if (nearestIndex !== currentIndexRef.current) {
        currentIndexRef.current = nearestIndex
        setCurrentIndex(nearestIndex)
        onCarouselChange?.(nearestIndex)
      }
    }

    const onScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateIndexBasedOnCenter)
    }

    // initial sync
    updateIndexBasedOnCenter()

    container.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      container.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [onCarouselChange, childrenArray.length, centerMode])

  // Handle drag-to-scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
      container.classList.add('cursor-grabbing')
      container.style.scrollSnapType = 'none'
    }

    const handleMouseLeaveOrUp = () => {
      isDown = false
      container.classList.remove('cursor-grabbing')
      container.style.scrollSnapType = 'x mandatory'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 1.5
      container.scrollLeft = scrollLeft - walk
    }

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseleave', handleMouseLeaveOrUp)
    container.addEventListener('mouseup', handleMouseLeaveOrUp)
    container.addEventListener('mousemove', handleMouseMove)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseleave', handleMouseLeaveOrUp)
      container.removeEventListener('mouseup', handleMouseLeaveOrUp)
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Compute padding for center mode
  useEffect(() => {
    if (!centerMode) return
    const container = scrollContainerRef.current
    if (!container) return

    const updatePadding = () => {
      setSidePadding(container.offsetWidth / 2)
    }

    updatePadding()
    window.addEventListener('resize', updatePadding)
    return () => window.removeEventListener('resize', updatePadding)
  }, [centerMode])

  return (
    <div className="flex flex-col gap-3" style={style}>
      {title && (
        <Text as={'h4'} size={'md'} weight="medium">
          {title}
        </Text>
      )}
      <div
        ref={scrollContainerRef}
        className={clsx('flex overflow-x-auto snap-x snap-mandatory scrollbar-hide cursor-grab', className)}
        style={{
          scrollSnapType: 'x mandatory',
          paddingLeft: centerMode ? sidePadding : undefined,
          paddingRight: centerMode ? sidePadding : undefined,
        }}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className="flex-shrink-0 snap-center" style={{ scrollSnapAlign: 'center' }}>
            {child}
          </div>
        ))}
      </div>

      {showIndicators && (
        <div className="flex justify-center gap-2 mt-2">
          {childrenArray.map((_, index) => (
            <div
              key={index}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-black' : 'bg-gray-300'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
