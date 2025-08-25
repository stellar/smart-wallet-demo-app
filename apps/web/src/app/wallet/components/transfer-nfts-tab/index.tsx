import { Button, Text, Icon, Input } from '@stellar/design-system'
import { useState, useMemo } from 'react'

import { Loading } from 'src/components/atoms'
import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { useGetNfts } from '../../queries/use-get-nfts'
import { Nft } from '../../services/wallet/types'

export const TransferNftsTab = () => {
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
      console.error('Failed to read clipboard contents: ', err)
    }
  }

  const handleReview = () => {
    // TODO: Implement review logic
    // console.log('Review transfer:', { selectedNfts: Array.from(selectedNfts), walletAddress })
  }

  const isReviewDisabled = selectedNfts.size === 0 || !walletAddress.trim()

  if (isLoadingNfts) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    )
  }

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
      {/* NFT Selection */}
      <div className=" rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          {nfts.map(nft => {
            const isSelected = selectedNfts.has(nft.id || '')

            return (
              <ImageCard
                key={nft.id}
                size="adapt"
                radius="min"
                imageUri={nft.url}
                onClick={() => handleNftToggle(nft.id || '')}
                isClickable={true}
                isSelected={isSelected}
              />
            )
          })}
        </div>
      </div>

      {/* Wallet Address Input */}
      <div className="bg-background rounded-lg p-6 shadow-sm border border-borderSecondary">
        <div className="space-y-3">
          <Input
            id="wallet-address"
            fieldSize="lg"
            label={c('transferNftsWalletAddressLabel')}
            placeholder={c('transferNftsWalletAddressPlaceholder')}
            value={walletAddress}
            onChange={handleWalletAddressChange}
            rightElement={
              <button
                onClick={handlePaste}
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

      {/* Review Button */}
      <Button variant="secondary" size="xl" isRounded isFullWidth disabled={isReviewDisabled} onClick={handleReview}>
        {c('transferNftsReviewButton')}
      </Button>

      {/* Alert */}
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
