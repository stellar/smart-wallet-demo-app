import { useMemo } from 'react'
import { Icon, Button } from '@stellar/design-system'

type Props = {
  type?: 'next' | 'previous' | 'close'
  size?: 'small' | 'medium'
  className?: string
  onClick?: () => void
}

export const NavigateButton = ({ type = 'previous', size = 'small', onClick }: Props) => {
  const label = useMemo(() => {
    const width = size === 'small' ? 12 : 14
    const height = size === 'small' ? 12 : 14

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
      case 'small':
        return {
          width: 28,
          height: 28,
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 8,
          paddingRight: 8,
        }
      case 'medium':
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
  )
}
