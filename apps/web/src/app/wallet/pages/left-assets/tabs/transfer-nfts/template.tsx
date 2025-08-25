import { Button, Text, Icon, Input } from '@stellar/design-system'

import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { Nft } from '../../../../services/wallet/types'

interface TransferNftsTemplateProps {
  nfts: Nft[]
  selectedNfts: Set<string>
  walletAddress: string
  onNftToggle: (nftId: string) => void
  onWalletAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPaste: () => void
  onReview: () => void
}

export const TransferNftsTemplate = ({
  nfts,
  selectedNfts,
  walletAddress,
  onNftToggle,
  onWalletAddressChange,
  onPaste,
  onReview,
}: TransferNftsTemplateProps) => {
  const isReviewDisabled = selectedNfts.size === 0 || !walletAddress.trim()

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-background rounded-lg p-6 shadow-sm border border-borderSecondary">
          <div className="text-center py-8">
            <Text as="p" size="md" className="text-textSecondary">
              {c('transferNftsNoNftsAvailable')}
            </Text>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          {nfts.map(nft => {
            const isSelected = selectedNfts.has(nft.id || '')
            return (
              <ImageCard
                key={nft.id}
                size="adapt"
                radius="min"
                imageUri={nft.url}
                onClick={() => onNftToggle(nft.id!)}
                isClickable={true}
                isSelected={isSelected}
              />
            )
          })}
        </div>
      </div>

      <div className="bg-background rounded-lg p-6 shadow-sm border border-borderSecondary">
        <div className="space-y-3">
          <Input
            id="wallet-address"
            fieldSize="lg"
            label={c('transferNftsWalletAddressLabel')}
            placeholder={c('transferNftsWalletAddressPlaceholder')}
            value={walletAddress}
            onChange={onWalletAddressChange}
            rightElement={
              <button
                onClick={onPaste}
                className="px-2 rounded-full border border-borderPrimary bg-backgroundPrimary hover:bg-muted transition-colors"
              >
                <Text as="span" size="md" className="font-semibold text-text text-xs">
                  {c('transferNftsPasteButton')}
                </Text>
              </button>
            }
          />

          <div className="text-center text-brandPrimary">
            <Text as="p" size="xs" className="font-semibold text-sm">
              {c('transferNftsNoWalletMessage')}
            </Text>
          </div>
        </div>
      </div>

      <Button variant="secondary" size="xl" isRounded isFullWidth disabled={isReviewDisabled} onClick={onReview}>
        {c('transferNftsReviewButton')}
      </Button>

      <div className="border border-borderPrimary rounded-lg p-3 flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          <Icon.AlertCircle size={18} className="text-brandPrimary" />
        </div>
        <div className="flex-1">
          <Text as="p" size="sm" className="text-text !leading-5">
            {c('transferNftsAlertTitle')}
          </Text>
        </div>
      </div>
    </div>
  )
}

export default TransferNftsTemplate
