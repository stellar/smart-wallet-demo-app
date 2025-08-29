import { Button, Text, Icon, CopyText } from '@stellar/design-system'
import clsx from 'clsx'
import { useState } from 'react'

import { BaseModalProps, ModalVariants } from '..'
import { NavigateButton } from '../../../molecules'
import { Carousel } from '../../carousel'
import { ImageCard } from '../../image-card'

export type ModalNftTransferReviewProps = {
  variant: Extract<ModalVariants, 'nft-transfer-review'>
  nfts: {
    id: string
    name: string
    imageUri: string
  }[]
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
  const [currentNftIndex, setCurrentNftIndex] = useState(0)
  const isLoading = internalState?.isLoading === true

  const handleCarouselChange = (index: number) => {
    setCurrentNftIndex(index)
  }

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <NavigateButton
        className="absolute -top-10 right-0"
        type="close"
        variant="ghost"
        onClick={isLoading ? undefined : onClose}
      />

      <div className="text-center">
        <Text as="h2" size="lg" className="text-xl font-semibold">
          {title}
        </Text>
      </div>

      <div className="flex flex-col gap-3">
        {nfts.length === 1 ? (
          <div className="flex flex-col items-center gap-3">
            <div className="border border-borderPrimary rounded-3xl">
              <ImageCard imageUri={nfts[0].imageUri} size="lg" radius="max" isClickable={false} />
            </div>
            <Text as="p" size="md" weight="medium" className="text-center">
              {nfts[0].name}
            </Text>
          </div>
        ) : (
          <>
            <Carousel title="" className="gap-4 py-2" onCarouselChange={handleCarouselChange}>
              {nfts.map((nft, _index) => (
                <div key={nft.id} className="flex flex-col items-center gap-3">
                  <div className="border border-borderPrimary rounded-3xl">
                    <ImageCard imageUri={nft.imageUri} size="lg" radius="max" isClickable={false} />
                  </div>
                  <Text as="p" size="md" weight="medium" className="text-center">
                    {nft.name}
                  </Text>
                </div>
              ))}
            </Carousel>

            <div className="flex justify-center gap-2">
              {nfts.map((_, index) => (
                <div
                  key={index}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentNftIndex ? 'bg-black' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col p-3 bg-backgroundSecondary  rounded-lg ">
        <Text as="h4" size="md" weight="medium" className="text-center text-textSecondary">
          {toLabel}
        </Text>
        <div className="flex items-center gap-2 p-2 justify-center">
          <div className="w-6 h-6 bg-cyan-50 rounded-full flex items-center justify-center">
            <Icon.Wallet02 size={12} className="text-cyan-500 text-sm" />
          </div>
          <Text as="span" size="md" className="flex-1 font-semibold text-center">
            {formatAddress(destinationAddress)}
          </Text>
          <CopyText textToCopy={destinationAddress} title={copyAddressTitle}>
            <div className="bg-backgroundPrimary w-6 h-6 rounded-full flex items-center justify-center border border-borderPrimary">
              <Icon.Copy01 size={12} className="text-gray-600 text-sm" />
            </div>
          </CopyText>
        </div>
      </div>

      <div className="flex flex-col gap-3">
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
