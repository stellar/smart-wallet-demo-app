import { Badge, Button, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useMemo } from 'react'

import { c } from 'src/interfaces/cms/useContent'

import { BaseModalProps, ModalVariants } from '..'
import { NavigateButton } from '../../../molecules'

export type ModalDefaultProps = {
  variant: Extract<ModalVariants, 'default'>
  textColor?: 'black' | 'white'
  badge?: {
    variant: 'airdrop' | 'nft' | 'nft-treasure' | 'special-gift'
  }
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
  badge,
  description,
  note,
  button,
  internalState,
  onClose,
}: BaseModalProps & ModalDefaultProps) => {
  const imageSizeMap = {
    sm: 'h-[80px] w-[80px]',
    md: 'h-[123px] w-[123px]',
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

  const ModalBadge = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="flex flex-col items-center">{children}</div>
    )

    switch (badge?.variant) {
      case 'airdrop':
        return (
          <Wrapper>
            <div className="yellow-badge">
              <Badge variant="success">{c('airdropBadge')}</Badge>
            </div>
          </Wrapper>
        )
      case 'nft':
        return (
          <Wrapper>
            <Badge variant="secondary">{c('nftBadge')}</Badge>
          </Wrapper>
        )
      case 'nft-treasure':
        return (
          <Wrapper>
            <Badge variant="secondary">{c('treasureBadge')}</Badge>
          </Wrapper>
        )
      case 'special-gift':
        return (
          <Wrapper>
            <Badge variant="secondary">{c('specialGiftBadge')}</Badge>
          </Wrapper>
        )
      default:
        return <></>
    }
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
        invertColor={textColor === 'white'}
        isBordered={false}
      />

      <ModalBadge />

      {/* Image */}
      {title?.image && <div className="flex justify-center">{renderImage(title.image)}</div>}

      <div className="flex flex-col gap-2">
        {/* Title */}
        {title && (
          <div className={clsx('text-center', textColor === 'white' && 'text-whitish')}>
            <Text as="h2" size="lg" weight="bold" style={{ fontSize: '1.5rem', lineHeight: '2rem' }}>
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
            <div className="mt-2 text-center text-textSecondary">
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
