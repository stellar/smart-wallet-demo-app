import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'

import { ScanTemplate } from './template'
import { WalletPagesPath } from '../../routes/types'

export const Scan = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  return <ScanTemplate onGoBack={handleGoBack} />
}
