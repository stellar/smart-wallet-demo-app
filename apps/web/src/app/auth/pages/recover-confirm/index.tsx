import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { RecoverConfirmTemplate } from './template'
import { useRecoverWallet } from '../../queries/use-recover-wallet'
import { recoverConfirmRoute } from '../../routes'

export const RecoverConfirm = () => {
  const search = recoverConfirmRoute.useSearch()
  const navigate = useNavigate()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const recoverWallet = useRecoverWallet({
    onSuccess: () => {
      setIsRedirecting(true)
      navigate({ to: WalletPagesPath.HOME })
    },
  })

  const handleCreatePasskey = () => {
    recoverWallet.mutate({ code: search.code })
  }

  return (
    <RecoverConfirmTemplate
      isRecoveringWallet={recoverWallet.isPending || isRedirecting}
      onCreatePasskey={handleCreatePasskey}
    />
  )
}
