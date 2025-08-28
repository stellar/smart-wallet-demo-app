import { Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  title?: string
  className?: string
  onCarouselChange?: (index: number) => void
}

export const Carousel = ({ children, title, className, onCarouselChange }: Props): React.ReactNode => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const childrenArray = Array.isArray(children) ? children : [children]

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || !onCarouselChange) return

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft
      const itemWidth = scrollContainer.scrollWidth / childrenArray.length
      const currentIndex = Math.round(scrollLeft / itemWidth)
      onCarouselChange(currentIndex)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [onCarouselChange, childrenArray.length])

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <Text as={'h4'} size={'md'} weight="medium">
          {title}
        </Text>
      )}
      <div
        ref={scrollContainerRef}
        className={clsx('flex', 'overflow-x-auto', 'snap-x', 'snap-mandatory', 'scrollbar-hide', className)}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className="flex-shrink-0 snap-center" style={{ scrollSnapAlign: 'center' }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Carousel
