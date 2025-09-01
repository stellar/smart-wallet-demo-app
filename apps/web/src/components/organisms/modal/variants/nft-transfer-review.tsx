import { Button, Text, Icon, CopyText } from '@stellar/design-system'
import { useMemo } from 'react'

import { createShortStellarAddress } from 'src/app/core/utils'
import { Nft } from 'src/app/wallet/services/wallet/types'

import { BaseModalProps, ModalVariants } from '..'
import { NavigateButton } from '../../../molecules'
import { Carousel } from '../../carousel'
import { ImageCard } from '../../image-card'

export type ModalNftTransferReviewProps = {
  variant: Extract<ModalVariants, 'nft-transfer-review'>
  nfts: Nft[]
  destinationAddress: string
  title: string
  toLabel: string
  copyAddressTitle: string
  disclaimer: string
  button: React.ComponentProps<typeof Button>
}

export const ModalNftTransferReview = ({
  nfts,
  destinationAddress,
  title,
  toLabel,
  copyAddressTitle,
  disclaimer,
  button,
  internalState,
  onClose,
}: BaseModalProps & ModalNftTransferReviewProps) => {
  const maxCarouselWidth = `${(window.innerWidth > 768 ? 768 : window.innerWidth) - 80}px`

  const isLoading = useMemo(() => !!internalState?.isLoading, [internalState?.isLoading])

  return (
    <div className="flex flex-col -mx-6 gap-6 pt-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
      {/* Close Button - Positioned outside modal */}
      <NavigateButton
        className="absolute -top-10 right-0"
        type="close"
        variant="ghost"
        onClick={isLoading ? undefined : onClose}
      />

      <div className="text-center px-6">
        <Text as="h2" size="xl" weight="semi-bold">
          {title}
        </Text>
      </div>

      <div className="flex flex-col px-6 gap-3">
        {nfts.length === 1 ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="border border-borderPrimary rounded-3xl">
              <ImageCard imageUri={nfts[0].url} size="lg" radius="max" isClickable={false} />
            </div>
            <Text as="p" size="md" weight="medium">
              {nfts[0].name}
            </Text>
          </div>
        ) : (
          <div>
            <Carousel
              className="gap-3 py-2 px-4 -mx-6"
              style={{
                maxWidth: maxCarouselWidth,
              }}
              centerMode
              showIndicators
            >
              {nfts.map((nft, _index) => (
                <div key={nft.id} className="flex flex-col items-center gap-3 text-center">
                  <div className="border border-borderPrimary rounded-3xl">
                    <ImageCard imageUri={nft.url} size="lg" radius="max" isClickable={false} />
                  </div>
                  <Text as="p" size="md" weight="medium">
                    {nft.name}
                  </Text>
                </div>
              ))}
            </Carousel>
          </div>
        )}
      </div>

      <div className="px-6">
        <div className="flex flex-col p-4 gap-2 bg-backgroundSecondary rounded-lg text-center">
          <Text as="h4" size="sm" weight="medium" addlClassName="text-textSecondary">
            {toLabel}
          </Text>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-6 h-6 bg-cyan-50 rounded-full flex items-center justify-center">
              <Icon.Wallet02 size={12} className="text-cyan-500 text-sm" />
            </div>
            <Text as="span" size="md" className="flex-1 font-semibold text-center">
              {createShortStellarAddress(destinationAddress, { sliceAmount: 8 })}
            </Text>
            <CopyText textToCopy={destinationAddress} title={copyAddressTitle}>
              <div className="bg-backgroundPrimary w-6 h-6 rounded-full flex items-center justify-center border border-borderPrimary">
                <Icon.Copy01 size={12} className="text-gray-600 text-sm" />
              </div>
            </CopyText>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-6 gap-4">
        <Button isLoading={isLoading} {...button} />

        <div className="text-center text-textSecondary">
          <Text as="p" size="sm">
            {disclaimer}
          </Text>
        </div>
      </div>
    </div>
  )
}
