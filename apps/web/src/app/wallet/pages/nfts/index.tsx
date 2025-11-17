import { useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

import { featureFlagsState } from 'src/app/core/helpers'

import NftsTemplate from './template'
import { ViewNftDrawer } from '../../components'
import { Nft } from '../../domain/models/nft'
import { useGetNfts } from '../../queries/use-get-nfts'
import { WalletPagesPath } from '../../routes/types'

export const Nfts = () => {
  const navigate = useNavigate()

  const [selectedNft, setSelectedNft] = useState<Nft | undefined>()
  const [isTransferLeftAssetsActive] = featureFlagsState(['transfer-left-assets'])

  const { data: nftsData, isLoading: isLoadingNfts } = useGetNfts()

  const nfts = useMemo((): Nft[] => {
    if (!nftsData?.data?.nfts) return []

    return nftsData.data.nfts.map((nft, index) => ({
      ...nft,
      id: `nft-${index}`,
      code: nft.name,
      issuer: 'API',
      transaction_hash: nft.transaction_hash,
    }))
  }, [nftsData])

  const handleGoBack = () => {
    navigate({
      to: WalletPagesPath.HOME,
      search: undefined,
      replace: true,
    })
  }

  const handleTransferClick = () => {
    navigate({ to: WalletPagesPath.LEFT_ASSETS, search: { tab: 'transfer-nfts' } })
  }

  const handleScanClick = () => navigate({ to: WalletPagesPath.SCAN })

  const handleClickNft = (nft: Nft) => {
    setSelectedNft(nft)
  }

  const handleCloseNftDrawer = () => {
    setSelectedNft(undefined)
  }

  return (
    <>
      <ViewNftDrawer
        nft={selectedNft}
        isTransferDisabled={!isTransferLeftAssetsActive}
        onClose={handleCloseNftDrawer}
        onTransferClick={handleTransferClick}
      />

      <NftsTemplate
        isLoadingNftsList={isLoadingNfts}
        nfts={nfts}
        onGoBack={handleGoBack}
        onScanClick={handleScanClick}
        onNftClick={handleClickNft}
      />
    </>
  )
}

export default Nfts
