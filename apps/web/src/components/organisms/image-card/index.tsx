import { Badge, Icon, IconButton, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { CustomCheckbox } from 'src/components/atoms'

import styles from './styles.module.css'

type Props = {
  imageUri: string
  variant?: 'enabled' | 'disabled'
  size?: 'sm' | 'md' | 'lg' | 'adapt'
  aspectVariant?: 'none' | 'square'
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
  isSelectable?: boolean
  isClickable?: boolean
  showLinkButton?: boolean
  onClick?: () => void
}

export const ImageCard = ({
  imageUri,
  variant = 'enabled',
  size = 'md',
  aspectVariant = 'square',
  radius = 'max',
  name,
  leftBadge,
  rightBadge,
  isSelected = false,
  isSelectable = false,
  isClickable = true,
  showLinkButton = false,
  onClick,
}: Props): React.ReactNode => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (aspectVariant === 'none') {
      const img = new Image()
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }
      img.onerror = () => {
        // Default to square dimensions if image fails to load
        setImageDimensions({ width: 1, height: 1 })
      }
      img.src = imageUri
    } else {
      setImageDimensions(null)
    }
  }, [imageUri, aspectVariant])

  const wrapperSizeClassNames = useMemo(() => {
    // Default square behavior
    switch (size) {
      case 'sm':
        return clsx('w-[179px]', 'h-[182px]')
      case 'md':
        return clsx('w-[220px]', 'h-[224px]')
      case 'lg':
        return clsx('w-[262px]', 'h-[266px]')
      case 'adapt':
        return clsx('w-full', 'aspect-square')
    }
  }, [size])

  const dynamicSizeStyle = useMemo(() => {
    if (aspectVariant === 'none' && imageDimensions) {
      const aspectRatio = imageDimensions.width / imageDimensions.height
      const isLandscape = imageDimensions.width > imageDimensions.height

      // Use natural aspect ratio with larger sizes
      switch (size) {
        case 'sm': {
          const baseWidth = 225
          const baseHeight = 230
          if (isLandscape) {
            return {
              width: `${baseWidth}px`,
              height: `${Math.round(baseWidth / aspectRatio)}px`,
            }
          } else {
            return {
              width: `${Math.round(baseHeight * aspectRatio)}px`,
              height: `${baseHeight}px`,
            }
          }
        }
        case 'md': {
          const baseWidth = 275
          const baseHeight = 280
          if (isLandscape) {
            return {
              width: `${baseWidth}px`,
              height: `${Math.round(baseWidth / aspectRatio)}px`,
            }
          } else {
            return {
              width: `${Math.round(baseHeight * aspectRatio)}px`,
              height: `${baseHeight}px`,
            }
          }
        }
        case 'lg': {
          const baseWidth = 330
          const baseHeight = 335
          if (isLandscape) {
            return {
              width: `${baseWidth}px`,
              height: `${Math.round(baseWidth / aspectRatio)}px`,
            }
          } else {
            return {
              width: `${Math.round(baseHeight * aspectRatio)}px`,
              height: `${baseHeight}px`,
            }
          }
        }
        case 'adapt': {
          return {
            width: '100%',
            aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
          }
        }
      }
    }
    return undefined
  }, [size, aspectVariant, imageDimensions])

  const wrapperStyle = useMemo(() => {
    const baseStyle = name
      ? undefined
      : {
          backgroundImage: `url(${imageUri})`,
        }

    if (aspectVariant === 'none' && dynamicSizeStyle) {
      return {
        ...baseStyle,
        ...dynamicSizeStyle,
      }
    }

    return baseStyle
  }, [imageUri, name, aspectVariant, dynamicSizeStyle])

  const sharedWrapperClassNames = useMemo(
    () =>
      clsx(
        (aspectVariant === 'square' || (aspectVariant === 'none' && !imageDimensions)) && wrapperSizeClassNames,
        (aspectVariant === 'square' || (aspectVariant === 'none' && !imageDimensions)) && 'bg-center',
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
    [radius, wrapperSizeClassNames, aspectVariant, imageDimensions]
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
      <div
        className={clsx(
          'absolute',
          isSelectable && typeof isSelected === 'boolean' ? 'bottom-3 left-3' : 'top-3 left-3'
        )}
      >
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

  const SelectionIndicator = () => {
    if (typeof isSelected !== 'boolean') return null

    return <CustomCheckbox checked={isSelected} size="md" onClick={onClick} className="absolute top-3 left-3 z-10" />
  }

  return (
    <Wrapper>
      <LeftBadgeComponent />

      <RightBadgeComponent />

      {isSelectable && <SelectionIndicator />}

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

      {isClickable && showLinkButton && (
        <div className="absolute bottom-4 right-2 rounded-lg">
          <IconButton
            altText={'External Link'}
            onClick={onClick}
            icon={
              <div className="flex justify-center items-center rounded-full w-[35px] h-[35px] p-[0.6rem] bg-backgroundPrimary border border-borderPrimary">
                <Icon.LinkExternal01 />
              </div>
            }
          />
        </div>
      )}
    </Wrapper>
  )
}
