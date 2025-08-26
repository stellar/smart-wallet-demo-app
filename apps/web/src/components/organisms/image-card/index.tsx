import { Badge, Icon, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useMemo } from 'react'

import styles from './styles.module.css'

type Props = {
  imageUri: string
  variant?: 'enabled' | 'disabled'
  size?: 'sm' | 'md' | 'lg' | 'adapt'
  radius?: 'min' | 'max'
  name?: string
  leftBadge?: {
    label: string
    variant: 'success' | 'disabled'
  }
  rightBadge?: {
    label: string
    variant: 'success' | 'disabled'
  }
  isSelected?: boolean
  isClickable?: boolean
  onClick?: () => void
}

export const ImageCard = ({
  imageUri,
  variant = 'enabled',
  size = 'md',
  radius = 'max',
  name,
  leftBadge,
  rightBadge,
  isSelected = false,
  isClickable = true,
  onClick,
}: Props): React.ReactNode => {
  const wrapperSizeClassNames = useMemo(() => {
    switch (size) {
      case 'sm':
        return clsx('w-[179px]', 'h-[182px]')
      case 'md':
        return clsx('w-[220px]', 'h-[224px]')
      case 'lg':
        return clsx('w-[262px]', 'h-[266px]')
      case 'adapt':
        return clsx('w-[45vw]', 'h-[45vw]')
    }
  }, [size])

  const wrapperStyle = useMemo(
    () =>
      name
        ? undefined
        : {
            backgroundImage: `url(${imageUri})`,
          },
    [imageUri, name]
  )

  const sharedWrapperClassNames = useMemo(
    () =>
      clsx(
        wrapperSizeClassNames,
        'relative',
        'flex',
        'flex-col',
        'justify-center',
        'bg-cover',
        'bg-whitish',
        'p-4',
        radius === 'max' && 'rounded-3xl',
        radius === 'min' && 'rounded-xl'
      ),
    [radius, wrapperSizeClassNames]
  )

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isClickable ? (
      <button
        id="image-card-wrapper"
        onClick={onClick}
        className={clsx(sharedWrapperClassNames, styles.card)}
        style={wrapperStyle}
      >
        {children}
      </button>
    ) : (
      <div id="image-card-wrapper" className={sharedWrapperClassNames} style={wrapperStyle}>
        {children}
      </div>
    )

  const LeftBadgeComponent = () =>
    leftBadge && (
      <div className="absolute top-3 left-3">
        {leftBadge.variant === 'disabled' ? (
          <Badge icon={<Icon.CheckCircle />} iconPosition="left" variant="tertiary">
            {leftBadge.label}
          </Badge>
        ) : (
          <Badge icon={<Icon.Gift01 />} iconPosition="left" variant="success">
            {leftBadge.label}
          </Badge>
        )}
      </div>
    )

  const RightBadgeComponent = () =>
    rightBadge && (
      <div className="absolute top-3 right-3">
        {rightBadge.variant === 'disabled' ? (
          <Badge variant="tertiary">{rightBadge.label}</Badge>
        ) : (
          <Badge variant="success">{rightBadge.label}</Badge>
        )}
      </div>
    )

  return (
    <Wrapper>
      <LeftBadgeComponent />

      <RightBadgeComponent />

      {isSelected && (
        <div className="absolute top-3 left-3">
          <div className="bg-brandPrimary rounded p-1">
            <Icon.Check size={14} className="text-white" />
          </div>
        </div>
      )}

      {name && (
        <div className="flex flex-col items-center gap-3">
          <img
            src={imageUri}
            className={clsx('max-h-[120px] min-h-[120px])', variant === 'disabled' && 'grayscale opacity-50')}
          />
          <div className="text-textSecondary">
            <Text as="p" size={'sm'} weight="medium">
              {name}
            </Text>
          </div>
        </div>
      )}
    </Wrapper>
  )
}
