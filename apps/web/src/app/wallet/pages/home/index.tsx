import { useNavigate } from '@tanstack/react-router'

import { HomeTemplate } from './template'
import { WalletPagesPath } from '../../routes/types'

export const Home = () => {
  const navigate = useNavigate()

  const handlePayClick = () => navigate({ to: WalletPagesPath.SCAN })

  const handleNavbarButtonClick = (_item: 'nft' | 'history' | 'profile') => {
    throw new Error('Function not implemented.')
  }

  return <HomeTemplate balanceAmount={0} onNavbarButtonClick={handleNavbarButtonClick} onPayClick={handlePayClick} />
}
