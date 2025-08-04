import clsx from 'clsx'
import { useEffect, useMemo, useRef } from 'react'

import {
  ModalDefault,
  ModalDefaultProps,
  ModalLoading,
  ModalLoadingProps,
  ModalTransactionDetails,
  ModalTransactionDetailsProps,
} from './variants'

export type ModalVariants = 'default' | 'transaction-details' | 'loading'

export type ModalInternalState = Record<string, unknown>

export type BaseModalProps = {
  backgroundImageUri?: string | 'default'
  internalState?: ModalInternalState
  onClose?: () => void
}

export type ModalProps = {
  variantOptions: ModalDefaultProps | ModalTransactionDetailsProps | ModalLoadingProps
} & BaseModalProps

export const Modal: React.FC<ModalProps> = ({ variantOptions, backgroundImageUri, internalState, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const isLocked = useRef(variantOptions.variant === 'loading' && variantOptions.isLocked)

  // ESC to close
  useEffect(() => {
    if (isLocked.current) return

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
    if (!isLocked.current && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.()
    }
  }

  const modalContent = useMemo(() => {
    switch (variantOptions.variant) {
      case 'default':
        return <ModalDefault {...variantOptions} internalState={internalState} onClose={onClose} />
      case 'transaction-details':
        return <ModalTransactionDetails {...variantOptions} internalState={internalState} onClose={onClose} />
      case 'loading':
        return <ModalLoading {...variantOptions} internalState={internalState} onClose={onClose} />
    }
  }, [internalState, onClose, variantOptions])

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full mx-4 max-w-md p-6 rounded-2xl shadow-xl',
          !backgroundImageUri && 'bg-backgroundSecondary'
        )}
        style={
          backgroundImageUri
            ? {
                backgroundImage: `url(${backgroundImageUri})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top',
              }
            : undefined
        }
      >
        {modalContent}
      </div>
    </div>
  )
}
