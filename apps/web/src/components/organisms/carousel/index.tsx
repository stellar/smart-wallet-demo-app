import { Text } from '@stellar/design-system'
import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  title?: string
  className?: string
}

export const Carousel = ({ children, title, className }: Props): React.ReactNode => {
  return (
    <div className="flex flex-col gap-3">
      {title && (
        <Text as={'h4'} size={'md'} weight="medium">
          {title}
        </Text>
      )}
      <div
        className={clsx('flex', 'overflow-x-auto', 'snap-x', 'snap-mandatory', 'scrollbar-hide', className)}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {(Array.isArray(children) ? children : [children]).map((child, index) => (
          <div key={index} className="flex-shrink-0 snap-center" style={{ scrollSnapAlign: 'center' }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Carousel
