import { Button, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useMemo } from 'react'

import { BaseModalProps, ModalVariants } from '..'
import { NavigateButton } from '../../../molecules'

export type ModalDefaultProps = {
  variant: Extract<ModalVariants, 'default'>
  textColor?: 'black' | 'white'
  title: {
    text: string
    image?: {
      source?: string | React.ReactNode | 'blank-space'
      variant?: 'sm' | 'md' | 'lg'
      format?: 'square' | 'circle'
    }
  }
  description: string
  note?: string
  button: React.ComponentProps<typeof Button>
}

export const ModalDefault = ({
  title,
  textColor = 'black',
  description,
  note,
  button,
  internalState,
  onClose,
}: BaseModalProps & ModalDefaultProps) => {
  const imageSizeMap = {
    sm: 'h-[80px] w-[80px]',
    md: 'h-[130px] w-[130px]',
    lg: 'h-[180px] w-[180px]',
  }

  const renderImage = (image: NonNullable<ModalDefaultProps['title']>['image']) => {
    if (!image) return null

    if (image.source === 'blank-space') {
      return <div className={imageSizeMap[image.variant ?? 'md']} />
    }

    if (typeof image.source === 'string') {
      return (
        <img
          src={image.source}
          alt="Modal image"
          className={clsx(
            'object-cover',
            image.format === 'circle' && 'rounded-full',
            image.format === 'square' && 'rounded-xl',
            imageSizeMap[image.variant ?? 'md']
          )}
        />
      )
    }

    return <div className={clsx(imageSizeMap[image.variant ?? 'md'])}>{image.source}</div>
  }

  const isLoading = useMemo(() => !!internalState?.isLoading, [internalState?.isLoading])

  return (
    <div className="flex flex-col gap-4">
      {/* Close Button */}
      <NavigateButton
        className="absolute top-4 right-4"
        type="close"
        variant="ghost"
        onClick={isLoading ? undefined : onClose}
      />
      {/* Image */}
      {title?.image && <div className="flex justify-center">{renderImage(title.image)}</div>}

      <div className="flex flex-col gap-2">
        {/* Title */}
        {title && (
          <div className={clsx('text-center', textColor === 'white' && 'text-whitish')}>
            <Text as="h2" size="lg" weight="bold" style={{ fontSize: '1.75rem' }}>
              {title.text}
            </Text>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className={clsx('text-center', textColor === 'white' && 'text-whitish')}>
            <Text as="p" size="md" weight="medium">
              {description}
            </Text>
          </div>
        )}
      </div>

      {/* Action Button & Note */}
      {button && (
        <div className="flex flex-col justify-center">
          <Button isLoading={isLoading} {...button} />
          {note && (
            <div className="mt-2 text-center">
              <Text as="p" size="sm">
                {note}
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
