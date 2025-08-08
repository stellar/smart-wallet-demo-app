import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import NftsTemplate from './template'
import { ViewNftDrawer } from '../../components'
import { Nft } from '../../domain/models/nft'
import { WalletPagesPath } from '../../routes/types'

export const Nfts = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  const [selectedNft, setSelectedNft] = useState<Nft | undefined>()

  const mockedNfts: Nft[] = [
    {
      id: '1',
      name: 'NFT #1',
      imageUri: 'https://images.wsj.net/im-491396?width=700&height=700',
    },
    {
      id: '2',
      name: 'NFT #2',
      imageUri: 'https://images.wsj.net/im-491398?width=700&height=700',
    },
    {
      id: '3',
      name: 'NFT #3',
      imageUri: 'https://images.wsj.net/im-491399?width=700&height=700',
    },
  ]

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

      <NftsTemplate isLoadingNftsList={false} nfts={mockedNfts} onGoBack={handleGoBack} onNftClick={handleClickNft} />
    </>
  )
}

export default Nfts
