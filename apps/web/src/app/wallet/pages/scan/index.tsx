import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'

import { ErrorHandling } from 'src/helpers/error-handling'

import { ScanTemplate } from './template'
import { useScanTxQrCode } from '../../queries/use-scan-tx-qr-code'
import { WalletPagesPath } from '../../routes/types'

export const Scan = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const scanTxQrCode = useScanTxQrCode({
    onSuccess: transferOptionsInput => {
      // Navigate to wallet home page with transfer options (trigger transfer initiation)
      navigate({
        to: WalletPagesPath.HOME,
        search: transferOptionsInput,
      })
    },
    onError: error => {
      ErrorHandling.handleError({ error })
      // Reset to wallet home page
      navigate({
        to: WalletPagesPath.HOME,
      })
    },
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  const handleScan = async (decodedText: string) => scanTxQrCode.mutate({ decodedText })

  return <ScanTemplate onGoBack={handleGoBack} onScan={handleScan} />
}
