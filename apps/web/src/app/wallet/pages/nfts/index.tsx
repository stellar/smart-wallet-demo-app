import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

import NftsTemplate from './template'
import { ViewNftDrawer } from '../../components'
import { useGetNfts } from '../../queries/use-get-nfts'
import { WalletPagesPath } from '../../routes/types'
import { Nft } from '../../services/wallet/types'

export const Nfts = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  const [selectedNft, setSelectedNft] = useState<Nft | undefined>()

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

  const handleGoBack = () => {
    if (canGoBack) router.history.back()
    navigate({ to: WalletPagesPath.HOME })
  }

  const handleClickNft = (nft: Nft) => {
    setSelectedNft(nft)
  }

  const handleCloseNftDrawer = () => {
    setSelectedNft(undefined)
  }

  return (
    <>
      <ViewNftDrawer nft={selectedNft} onClose={handleCloseNftDrawer} />

      <NftsTemplate isLoadingNftsList={isLoadingNfts} nfts={nfts} onGoBack={handleGoBack} onNftClick={handleClickNft} />
    </>
  )
}

export default Nfts
