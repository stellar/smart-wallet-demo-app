import { useState, useMemo } from 'react'

import { Loading } from 'src/components/atoms'

import { useGetNfts } from '../../../../queries/use-get-nfts'
import { Nft } from '../../../../services/wallet/types'
import TransferNftsTemplate from './template'

export const TransferNfts = () => {
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set())
  const [walletAddress, setWalletAddress] = useState('')

  const { data: nftsData, isLoading: isLoadingNfts } = useGetNfts()

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

  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setWalletAddress(text)
    } catch (err) {
    }
  }

  const handleReview = () => {
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
      walletAddress={walletAddress}
      onNftToggle={handleNftToggle}
      onWalletAddressChange={handleWalletAddressChange}
      onPaste={handlePaste}
      onReview={handleReview}
    />
  )
}

export default TransferNfts
