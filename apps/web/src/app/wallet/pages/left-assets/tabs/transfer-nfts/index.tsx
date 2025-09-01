import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { walletAddressFormSchema, WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { Nft } from 'src/app/wallet/domain/models/nft'
import { getNfts, useGetNfts } from 'src/app/wallet/queries/use-get-nfts'
import { getWallet } from 'src/app/wallet/queries/use-get-wallet'
import { useTransfer } from 'src/app/wallet/queries/use-transfer'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { modalService } from 'src/components/organisms/modal/provider'
import { c } from 'src/interfaces/cms/useContent'
import { queryClient } from 'src/interfaces/query-client'

import TransferNftsTemplate from './template'

export const TransferNfts = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set())

  const nftTransferReviewModalKey = 'nft-transfer-review'

  const { data: nftsData, isLoading: isLoadingNfts } = useGetNfts()

  const nftsReviewForm = useForm<WalletAddressFormValues>({
    resolver: yupResolver(walletAddressFormSchema),
    mode: 'onSubmit',
  })

  const nfts = useMemo((): Nft[] => {
    if (!nftsData?.data?.nfts) return []

    return nftsData.data.nfts.map((nft, index) => ({
      ...nft,
      id: `nft-${index}`,
      code: nft.name,
      issuer: 'API',
    }))
  }, [nftsData])

  useEffect(() => {
    if (nfts.length > 0) {
      setSelectedNfts(new Set(nfts.map(nft => nft.id || '')))
    }
  }, [nfts])

  const transfer = useTransfer({
    onSuccess: () => {
      modalService.close()
      queryClient.forceRefetch(getWallet())
      queryClient.forceRefetch(getNfts())
      nftsReviewForm.reset()
      setSelectedNfts(new Set())

      // Show success modal
      modalService.open({
        key: 'transfer-success',
        variantOptions: {
          variant: 'transfer-success',
          title: c('transferSuccessModalTitle'),
          message: c('transferNftSuccessModalMessage'),
          buttonText: c('transferSuccessModalButtonText'),
          button: {
            variant: 'secondary',
            size: 'lg',
            isRounded: true,
            isFullWidth: true,
            onClick: () => {
              modalService.close()
              navigate({ to: WalletPagesPath.HOME })
            },
          },
        },
      })
    },
  })

  const handleNftToggle = (nftId: string) => {
    const newSelected = new Set(selectedNfts)
    if (newSelected.has(nftId)) {
      newSelected.delete(nftId)
    } else {
      newSelected.add(nftId)
    }
    setSelectedNfts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedNfts.size === nfts.length) {
      setSelectedNfts(new Set())
    } else {
      setSelectedNfts(new Set(nfts.map(nft => nft.id || '')))
    }
  }

  const handleReview = (values: WalletAddressFormValues) => {
    if (selectedNfts.size === 0) {
      toast.notify({
        message: c('transferNftsSelectNftError'),
        type: Toast.toastType.ERROR,
      })
      return
    }

    const selectedNftsList = Array.from(selectedNfts)
      .map(id => nfts.find(n => n.id === id))
      .filter((nft): nft is NonNullable<typeof nft> => Boolean(nft))

    modalService.open({
      key: nftTransferReviewModalKey,
      variantOptions: {
        variant: 'nft-transfer-review',
        nfts: selectedNftsList,
        destinationAddress: values.walletAddress,
        title: c('transferNftsReviewModalTitle'),
        toLabel: c('transferNftsReviewModalToLabel'),
        copyAddressTitle: c('transferNftsReviewModalCopyAddressTitle'),
        disclaimer: c('transferNftsReviewModalDisclaimer'),
        button: {
          children: c('transferNftsConfirmTransferButton'),
          variant: 'secondary',
          size: 'lg',
          isRounded: true,
          onClick: () => {
            transfer.mutate({
              type: 'nft',
              to: values.walletAddress,
              asset: selectedNftsList
                .map(nft => nft.contract_address)
                .filter(Boolean)
                .join(','),
              id: selectedNftsList
                .map(nft => nft.token_id)
                .filter(Boolean)
                .join(','),
            })
          },
        },
      },
    })
  }

  useEffect(() => {
    modalService.setState(nftTransferReviewModalKey, { isLoading: transfer.isPending })
  }, [transfer.isPending])

  return (
    <TransferNftsTemplate
      isLoadingNfts={isLoadingNfts}
      nfts={nfts}
      selectedNfts={selectedNfts}
      nftsReviewForm={nftsReviewForm}
      onNftToggle={handleNftToggle}
      onSelectAll={handleSelectAll}
      onReview={handleReview}
    />
  )
}

export default TransferNfts
