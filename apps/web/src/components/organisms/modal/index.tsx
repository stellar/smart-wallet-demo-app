import clsx from 'clsx'
import { motion } from 'framer-motion'
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

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLocked.current && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.()
    }
  }

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

  // Lock when loading
  useEffect(() => {
    if (internalState?.isLoading === true) {
      isLocked.current = true
    } else if (internalState?.isLoading === false) {
      isLocked.current = false
    }
  }, [internalState?.isLoading])

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
    <motion.div
      data-testid="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx('absolute inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity')}
      onClick={handleBackdropClick}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className={clsx(
          'relative w-full mx-4 max-w-lg p-6 rounded-2xl shadow-xl',
          !backgroundImageUri && 'bg-backgroundSecondary'
        )}
        style={
          backgroundImageUri
            ? {
                backgroundImage: `url(${backgroundImageUri})`,
                backgroundSize: 'cover',
                backgroundPositionY: 'top',
                backgroundPositionX: 'center',
              }
            : undefined
        }
      >
        {modalContent}
      </motion.div>
    </motion.div>
  )
}
