import { Text, Icon } from '@stellar/design-system'
import { UseFormReturn } from 'react-hook-form'

import { WalletAddressForm } from 'src/app/wallet/components'
import { WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { Nft } from 'src/app/wallet/services/wallet/types'
import { CustomCheckbox } from 'src/components/atoms'
import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

interface TransferNftsTemplateProps {
  nfts: Nft[]
  selectedNfts: Set<string>
  nftsReviewForm: UseFormReturn<WalletAddressFormValues>
  onNftToggle: (nftId: string) => void
  onSelectAll: () => void
  onReview: (values: WalletAddressFormValues) => void
}

export const TransferNftsTemplate = ({
  nfts,
  selectedNfts,
  nftsReviewForm,
  onNftToggle,
  onSelectAll,
  onReview,
}: TransferNftsTemplateProps) => {
  const isReviewDisabled = selectedNfts.size === 0
  const isAllSelected = nfts.length > 0 && selectedNfts.size === nfts.length

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-background rounded-2xl p-6 shadow-sm border-borderSecondary">
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
      <div className="flex items-center justify-between">
        <Text as="span" size="sm" className="text-textSecondary text-sm">
          {nfts.length} {c('transferNftsNftsCount')}
        </Text>
        <button onClick={onSelectAll} className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <CustomCheckbox checked={isAllSelected} size="md" onClick={onSelectAll} />
          <Text as="span" size="sm" className="font-medium text-sm text-textSecondary">
            {c('transferNftsSelectAllButton')}
          </Text>
        </button>
      </div>

      <div className="rounded-2xl">
        <div className="grid grid-cols-2 gap-3">
          {nfts.map(nft => {
            const nftId = nft.id || ''
            const isSelected = selectedNfts.has(nftId)

            return (
              <ImageCard
                key={nft.id}
                size="adapt"
                radius="min"
                imageUri={nft.url}
                onClick={() => onNftToggle(nftId)}
                isClickable={true}
                isSelected={isSelected}
              />
            )
          })}
        </div>
      </div>

      <WalletAddressForm
        form={nftsReviewForm}
        submitButtonText={c('transferNftsReviewButton')}
        submitVariant="outside"
        isSubmitDisabled={isReviewDisabled}
        onSubmit={onReview}
      />

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
