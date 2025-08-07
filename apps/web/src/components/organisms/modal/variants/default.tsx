import { Button, Text } from '@stellar/design-system'
import clsx from 'clsx'

import { BaseModalProps, ModalVariants } from '..'
import { NavigateButton } from '../../../molecules'

export type ModalDefaultProps = {
  variant: Extract<ModalVariants, 'default'>
  title: {
    text: string
    image?: {
      source?: string | React.ReactNode | 'blank-space'
      variant?: 'sm' | 'md' | 'lg'
    }
  }
  description: string
  button: React.ComponentProps<typeof Button>
}

export const ModalDefault = ({ title, description, button, onClose }: BaseModalProps & ModalDefaultProps) => {
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
          className={clsx('object-cover rounded-full', imageSizeMap[image.variant ?? 'md'])}
        />
      )
    }

    return <div className={clsx(imageSizeMap[image.variant ?? 'md'])}>{image.source}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Close Button */}
      <NavigateButton className="absolute top-4 right-4" type="close" variant="ghost" onClick={onClose} />
      {/* Image */}
      {title?.image && <div className="flex justify-center">{renderImage(title.image)}</div>}

      <div className="flex flex-col gap-2">
        {/* Title */}
        {title && (
          <div className="text-center">
            <Text as="h2" size="lg" weight="bold" style={{ fontSize: '1.75rem' }}>
              {title.text}
            </Text>
          </div>
        )}

        {/* Description */}
        {description && (
          <Text addlClassName="text-center" as="p" size="md">
            {description}
          </Text>
        )}
      </div>

      {/* Action Button */}
      {button && (
        <div className="flex justify-center">
          <Button {...button} />
        </div>
      )}
    </div>
  )
}
