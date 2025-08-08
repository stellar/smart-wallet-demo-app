import { Button, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo } from 'react'

import { NavigateButton } from 'src/components/molecules'
import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { Nft } from '../../domain/models/nft'

type Props = {
  nft: Nft | undefined
  onClose: () => void
}

export const ViewNftDrawer = ({ nft, onClose }: Props) => {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const title = useMemo(() => `${nft?.name}${c('viewNftDrawerTitle')}`, [nft?.name])

  return (
    <AnimatePresence>
      {nft && (
        <motion.div
          key={'backdrop'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={clsx('fixed inset-0 z-50 flex items-end justify-center bg-black/70  transition-opacity')}
          onClick={onClose}
        >
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={clsx(
              'w-full relative bg-backgroundSecondary rounded-t-3xl min-h-[92.5%] overflow-y-auto shadow-lg transform transition-transform'
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <NavigateButton
              className="absolute top-[33px] right-5"
              variant="secondary"
              type="close"
              size="sm"
              onClick={onClose}
            />

            <div className="flex flex-col mt-[61px] gap-8 p-6">
              {/* Title & Subtitle */}
              <div className="flex flex-col text-center gap-1">
                <Text as="h2" size="xl" weight="semi-bold">
                  {title}
                </Text>
                <div className="text-textSecondary">
                  <Text as="p" size="md" weight="medium">
                    {c('viewNftDrawerSubtitle')}
                  </Text>
                </div>
              </div>

              {/* NFT Image */}
              <div className="flex justify-center">
                {nft?.imageUri && <ImageCard size="lg" radius="min" imageUri={nft?.imageUri} isClickable={false} />}
              </div>

              {/* Transfer Button */}
              <Button variant={'secondary'} size={'lg'} disabled isRounded isFullWidth>
                {c('transfer')}
              </Button>

              {/* Disabled Reason */}
              <div className="text-center text-textSecondary">
                <Text as="p" size="sm">
                  {c('viewNftDrawerDisclaimer')}
                </Text>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
