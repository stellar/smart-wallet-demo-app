import { useNavigate } from '@tanstack/react-router'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { HomeTemplate } from './template'
import { useGetWallet } from '../../queries/use-get-wallet'

export const Home = () => {
  const navigate = useNavigate()

  const getWallet = useGetWallet()
  const walletData = getWallet.data?.data

  const handlePayClick = () => navigate({ to: WalletPagesPath.SCAN })

  const handleNavbarButtonClick = (item: 'nft' | 'history' | 'profile') => {
    if (item === 'profile') {
      navigate({ to: WalletPagesPath.PROFILE })
    } else if (item === 'history') {
      navigate({ to: WalletPagesPath.TRANSACTIONS })
    } else {
      // Not implemented for other items
      throw new Error('Function not implemented.')
    }
  }

  return (
    <HomeTemplate
      isLoadingBalance={getWallet.isPending}
      balanceAmount={walletData?.balance || 0}
      onNavbarButtonClick={handleNavbarButtonClick}
      onPayClick={handlePayClick}
    />
  )
}
