import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { RecoverConfirmTemplate } from './template'
import { useRecoverWallet } from '../../queries/use-recover-wallet'
import { recoverConfirmRoute } from '../../routes'
import { AuthPagesPath } from '../../routes/types'

export const RecoverConfirm = () => {
  const router = useRouter()
  const search = recoverConfirmRoute.useSearch()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const [isRedirecting, setIsRedirecting] = useState(false)

  const recoverWallet = useRecoverWallet({
    onSuccess: () => {
      setIsRedirecting(true)
    },
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: AuthPagesPath.WELCOME })
  }

  const handleCreatePasskey = () => {
    recoverWallet.mutate({ code: search.code })
  }

  return (
    <RecoverConfirmTemplate
      isRecoveringWallet={recoverWallet.isPending || isRedirecting}
      onGoBack={handleGoBack}
      onCreatePasskey={handleCreatePasskey}
    />
  )
}
