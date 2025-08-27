import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

import { NavigateButton } from 'src/components/molecules'

type Props = {
  children: React.ReactNode
  size?: 'default' | 'max-height'
  closeButtonVariant?: React.ComponentProps<typeof NavigateButton>['variant']
  isOpen: boolean
  isLocked?: boolean
  hasCloseButton?: boolean
  onClose: () => void
}

export const Drawer = ({
  children,
  size = 'default',
  closeButtonVariant = 'secondary',
  isOpen,
  isLocked,
  hasCloseButton = false,
  onClose,
}: Props): React.ReactNode => {
  // ESC to close
  useEffect(() => {
    if (isLocked) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLocked, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid="drawer-backdrop"
          key={'backdrop'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={clsx('fixed inset-0 z-50 flex items-end justify-center bg-black/70  transition-opacity')}
          onClick={isLocked ? undefined : onClose}
        >
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={clsx(
              'w-full relative flex flex-col bg-backgroundSecondary rounded-t-3xl max-h-[92.5%] shadow-lg transform transition-transform',
              size === 'max-height' && 'min-h-[92.5%]'
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            {hasCloseButton && (
              <NavigateButton
                className="absolute top-[33px] right-5"
                variant={closeButtonVariant}
                invertColor={closeButtonVariant !== 'ghost'}
                type="close"
                size="sm"
                onClick={isLocked ? undefined : onClose}
              />
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto scrollbar-hide">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Drawer
