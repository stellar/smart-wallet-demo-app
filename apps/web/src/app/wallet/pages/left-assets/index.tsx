import { useNavigate } from '@tanstack/react-router'

import LeftAssetsTemplate from './template'
import { WalletPagesPath } from '../../routes/types'

export const LeftAssets = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate({
      to: WalletPagesPath.HOME,
      search: undefined,
      replace: true,
    })
  }

  return <LeftAssetsTemplate onGoBack={handleGoBack} />
}

export default LeftAssets
