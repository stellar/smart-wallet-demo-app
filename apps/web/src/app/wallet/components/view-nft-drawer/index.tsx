import { Button, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { NavigateButton } from 'src/components/molecules'
import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { Nft } from '../../domain/models/nft'

type Props = {
  nft: Nft | undefined
  onClose: () => void
}

export const ViewNftDrawer = ({ nft, onClose }: Props) => {
  const animationDuration = 300 // ms

  const [internalNft, setInternalNft] = useState<Nft | undefined>(nft)
  const [visible, setVisible] = useState(!!nft)
  const [animatingIn, setAnimatingIn] = useState(false)
  const [animatingOut, setAnimatingOut] = useState(false)

  // Transition effect
  useEffect(() => {
    if (nft) {
      setVisible(true)
      setInternalNft(nft)
      setAnimatingOut(false)
      // trigger animation *after* DOM renders
      setTimeout(() => setAnimatingIn(true), 10)
    } else {
      setAnimatingIn(false)
      setAnimatingOut(true)
      const timeout = setTimeout(() => {
        setVisible(false)
        setInternalNft(undefined)
        setAnimatingOut(false)
      }, animationDuration)
      return () => clearTimeout(timeout)
    }
  }, [nft])

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

  const title = useMemo(() => `${internalNft?.name}${c('viewNftDrawerTitle')}`, [internalNft?.name])

  if (!visible) return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-end justify-center bg-black/70  transition-opacity',
        `duration-${animationDuration}`,
        animatingOut ? 'opacity-0' : 'opacity-100'
      )}
      onClick={onClose}
    >
      <div
        className={clsx(
          'w-full bg-backgroundSecondary rounded-t-3xl min-h-[92.5%] overflow-y-auto shadow-lg transform transition-transform',
          `duration-${animationDuration}`,
          animatingOut ? 'translate-y-full' : animatingIn ? 'translate-y-0' : 'translate-y-full'
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
            {internalNft?.imageUri && (
              <ImageCard size="lg" radius="min" imageUri={internalNft?.imageUri} isClickable={false} />
            )}
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
      </div>
    </div>
  )
}
