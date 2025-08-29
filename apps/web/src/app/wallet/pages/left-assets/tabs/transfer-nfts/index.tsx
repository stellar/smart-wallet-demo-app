import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { walletAddressFormSchema, WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { Loading } from 'src/components/atoms'
import { modalService } from 'src/components/organisms/modal/provider'
import { ErrorHandling } from 'src/helpers/error-handling'
import { c } from 'src/interfaces/cms/useContent'

import TransferNftsTemplate from './template'
import { useGetNfts } from '../../../../queries/use-get-nfts'
import { useGetTransferOptions } from '../../../../queries/use-get-transfer-options'
import { useTransfer } from '../../../../queries/use-transfer'
import { Nft } from '../../../../services/wallet/types'

export const TransferNfts = () => {
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set())
  const [walletAddress, setWalletAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const toast = useToast()
  const { data: nftsData, isLoading: isLoadingNfts } = useGetNfts()

  const nftsReviewForm = useForm<WalletAddressFormValues>({
    resolver: yupResolver(walletAddressFormSchema),
    mode: 'onSubmit',
  })

  const getTransferOptions = useGetTransferOptions({
    onSuccess: result => {
      // Execute the transfer with the options
      transfer.mutate({
        type: 'nft',
        to: walletAddress,
        asset: 'NFT', // This will be the asset code for NFTs
        id: Array.from(selectedNfts)
          .map(id => {
            const nft = nfts.find(n => n.id === id)
            return nft?.token_id || ''
          })
          .filter(Boolean)
          .join(','),
        optionsJSON: result.data.options_json,
      })
    },
    onError: error => {
      ErrorHandling.handleError({ error })
      setIsTransferring(false)
    },
  })

  const transfer = useTransfer({
    onSuccess: () => {
      toast.notify({
        message: c('transferSuccess'),
        type: Toast.toastType.SUCCESS,
      })
      setIsTransferring(false)
      modalService.close()

      // Show success modal
      modalService.open({
        key: 'transfer-success',
        width: 'w-80',
        variantOptions: {
          variant: 'transfer-success',
          title: c('transferSuccessModalTitle'),
          message: c('transferSuccessModalMessage'),
          buttonText: c('transferSuccessModalButtonText'),
          button: {
            variant: 'secondary',
            size: 'xl',
            isRounded: true,
            isFullWidth: true,
            onClick: () => {
              modalService.close()
              // Reset form
              setSelectedNfts(new Set())
              nftsReviewForm.reset()
            },
          },
        },
        onClose: () => {
          // Reset form
          setSelectedNfts(new Set())
          nftsReviewForm.reset()
        },
      })
    },
    onError: error => {
      ErrorHandling.handleError({ error })
      setIsTransferring(false)
    },
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
    const walletAddressValue = values.walletAddress

    if (!walletAddressValue.trim()) {
      toast.notify({
        message: c('transferNftsEnterWalletAddressError'),
        type: Toast.toastType.ERROR,
      })
      return
    }

    if (selectedNfts.size === 0) {
      toast.notify({
        message: c('transferNftsSelectNftError'),
        type: Toast.toastType.ERROR,
      })
      return
    }

    const selectedNftsList = Array.from(selectedNfts).map(id => {
      const nft = nfts.find(n => n.id === id)
      return {
        id: nft?.id || '',
        name: nft?.name || '',
        imageUri: nft?.url || '',
      }
    })

    modalService.open({
      key: 'nft-transfer-review',
      variantOptions: {
        variant: 'nft-transfer-review',
        nfts: selectedNftsList,
        destinationAddress: walletAddress,
        button: {
          children: isTransferring ? c('transferNftsTransferringButton') : c('transferNftsConfirmTransferButton'),
          variant: 'secondary',
          size: 'xl',
          isRounded: true,
          disabled: isTransferring,
          onClick: async () => {
            setIsTransferring(true)
            modalService.close()

            try {
              // Get transfer options first
              await getTransferOptions.mutateAsync({
                type: 'nft',
                to: walletAddress,
                asset: Array.from(selectedNfts)
                  .map(id => {
                    const nft = nfts.find(n => n.id === id)
                    return nft?.contract_address || ''
                  })
                  .filter(Boolean)
                  .join(','),
                id: Array.from(selectedNfts)
                  .map(id => {
                    const nft = nfts.find(n => n.id === id)
                    return nft?.token_id || ''
                  })
                  .filter(Boolean)
                  .join(','),
              })
            } catch (error) {
              setIsTransferring(false)
              ErrorHandling.handleError({ error })
            }
          },
        },
      },
      onClose: () => {
        // Handle modal close if needed
      },
    })
  }

  if (isLoadingNfts) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    )
  }

  return (
    <TransferNftsTemplate
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
