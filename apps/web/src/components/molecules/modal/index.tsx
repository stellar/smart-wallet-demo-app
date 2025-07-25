import { Button, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import { NavigateButton } from '../navigate-button'

export type ModalProps = {
  title: {
    text: string
    image?: {
      source?: string | React.ReactNode | 'blank-space'
      variant?: 'sm' | 'md' | 'lg'
    }
  }
  description: string
  backgroundImageUri?: string
  button: React.ComponentProps<typeof Button>
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({ title, description, backgroundImageUri, button, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const imageSizeMap = {
    sm: 'h-[80px] w-[80px]',
    md: 'h-[130px] w-[130px]',
    lg: 'h-[180px] w-[180px]',
  }

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.()
    }
  }

  const renderImage = (image: Exclude<ModalProps['title']['image'], undefined>) => {
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
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full mx-4 max-w-md p-6 rounded-2xl shadow-xl bg-backgroundSecondary overflow-hidden'
        )}
        style={{
          backgroundImage: backgroundImageUri ? `url(${backgroundImageUri})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }}
      >
        {/* Close Button */}
        <NavigateButton className="absolute top-4 right-4" type="close" variant="ghost" onClick={onClose} />

        <div className="flex flex-col gap-4">
          {/* Image */}
          {title.image && <div className="flex justify-center">{renderImage(title.image)}</div>}

          <div className="flex flex-col gap-2">
            {/* Title */}
            <div className="text-center">
              <Text as="h2" size="lg" weight="bold" style={{ fontSize: '1.75rem' }}>
                {title.text}
              </Text>
            </div>

            {/* Description */}
            <Text addlClassName="text-center" as="p" size="md">
              {description}
            </Text>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button {...button} />
          </div>
        </div>
      </div>
    </div>
  )
}
