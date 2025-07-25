import { useNavigate } from '@tanstack/react-router'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { HomeTemplate } from './template'

export const Home = () => {
  const navigate = useNavigate()

  const handlePayClick = () => navigate({ to: WalletPagesPath.SCAN })

  const handleNavbarButtonClick = (item: 'nft' | 'history' | 'profile') => {
    if (item === 'profile') {
      navigate({ to: WalletPagesPath.PROFILE })
    } else {
      // Not implemented for other items
      throw new Error('Function not implemented.')
    }
  }

  return <HomeTemplate balanceAmount={0} onNavbarButtonClick={handleNavbarButtonClick} onPayClick={handlePayClick} />
}
