import { useNavigate } from '@tanstack/react-router'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { RecoverConfirmTemplate } from './template'
import { useRecoverWallet } from '../../queries/use-recover-wallet'
import { recoverConfirmRoute } from '../../routes'

export const RecoverConfirm = () => {
  const search = recoverConfirmRoute.useSearch()
  const navigate = useNavigate()

  const recoverWallet = useRecoverWallet({
    onSuccess: () => {
      navigate({ to: WalletPagesPath.HOME })
    },
  })

  const handleCreatePasskey = () => {
    recoverWallet.mutate({ code: search.code })
  }

  return <RecoverConfirmTemplate isRecoveringWallet={recoverWallet.isPending} onCreatePasskey={handleCreatePasskey} />
}
