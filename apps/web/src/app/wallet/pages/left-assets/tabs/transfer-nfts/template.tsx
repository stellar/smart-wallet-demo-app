import { Text, Notification } from '@stellar/design-system'
import { UseFormReturn } from 'react-hook-form'
import Skeleton from 'react-loading-skeleton'

import { WalletAddressForm } from 'src/app/wallet/components'
import { WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { Nft } from 'src/app/wallet/domain/models/nft'
import { CustomCheckbox } from 'src/components/atoms'
import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

interface TransferNftsTemplateProps {
  isLoadingNfts: boolean
  nfts: Nft[]
  selectedNfts: Set<string>
  nftsReviewForm: UseFormReturn<WalletAddressFormValues>
  onNftToggle: (nftId: string) => void
  onSelectAll: () => void
  onReview: (values: WalletAddressFormValues) => void
}

export const TransferNftsTemplate = ({
  isLoadingNfts,
  nfts,
  selectedNfts,
  nftsReviewForm,
  onNftToggle,
  onSelectAll,
  onReview,
}: TransferNftsTemplateProps) => {
  const isReviewDisabled = selectedNfts.size === 0
  const isAllSelected = nfts.length > 0 && selectedNfts.size === nfts.length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {isLoadingNfts ? (
          <div className="w-full">
            <Skeleton height={37} />
          </div>
        ) : (
          <>
            <Text as="span" size="sm" className="text-textSecondary text-sm">
              {nfts.length} {c('transferNftsNftsCount')}
            </Text>
            <button onClick={onSelectAll} className="flex items-center gap-2 px-3 py-2 rounded-lg">
              <CustomCheckbox checked={isAllSelected} size="md" onClick={onSelectAll} />
              <Text as="span" size="sm" className="font-medium text-sm text-textSecondary">
                {c('transferNftsSelectAllButton')}
              </Text>
            </button>
          </>
        )}
      </div>

      <div className="rounded-2xl">
        <div className="grid grid-cols-2 gap-3">
          {isLoadingNfts && (
            <>
              <Skeleton count={2} className="mb-2 rounded-xl w-full aspect-square" />
              <Skeleton count={2} className="mb-2 rounded-xl w-full aspect-square" />
            </>
          )}

          {!isLoadingNfts &&
            nfts.map(nft => {
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
                  isSelectable={true}
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

      <Notification variant="primary" title={c('transferNftsAlertTitle')} />
    </div>
  )
}

export default TransferNftsTemplate
