import { Icon, Button } from '@stellar/design-system'
import { useMemo } from 'react'

type Props = {
  type?: 'next' | 'previous' | 'close'
  size?: 'sm' | 'md'
  className?: string
  onClick?: () => void
}

export const NavigateButton = ({ type = 'previous', size = 'sm', className, onClick }: Props) => {
  const label = useMemo(() => {
    const width = size === 'sm' ? 12 : 14
    const height = size === 'sm' ? 12 : 14

    switch (type) {
      case 'next':
        return <Icon.ArrowRight width={width} height={height} />
      case 'previous':
        return <Icon.ArrowLeft width={width} height={height} />
      case 'close':
        return <Icon.XClose width={width} height={height} />
    }
  }, [size, type])

  const style = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          width: 28,
          height: 28,
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 8,
          paddingRight: 8,
        }
      case 'md':
        return {
          width: 34,
          height: 34,
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 10,
          paddingRight: 10,
        }
    }
  }, [size])

  return (
    <div className={className}>
      <Button
        variant={'tertiary'}
        size={'lg'}
        style={{
          borderRadius: '50%',
          ...style,
        }}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  )
}
