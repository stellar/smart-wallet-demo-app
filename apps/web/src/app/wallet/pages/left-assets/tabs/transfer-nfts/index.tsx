import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { walletAddressFormSchema, WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { Loading } from 'src/components/atoms'

import TransferNftsTemplate from './template'
import { useGetNfts } from '../../../../queries/use-get-nfts'
import { Nft } from '../../../../services/wallet/types'

export const TransferNfts = () => {
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set())

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

  const handleNftToggle = (nftId: string) => {
    const newSelected = new Set(selectedNfts)
    if (newSelected.has(nftId)) {
      newSelected.delete(nftId)
    } else {
      newSelected.add(nftId)
    }
    setSelectedNfts(newSelected)
  }

  const handleReview = (_values: WalletAddressFormValues) => {
    // TODO: open transfer drawer function
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
      onReview={handleReview}
    />
  )
}

export default TransferNfts
