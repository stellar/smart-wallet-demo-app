import { useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthPagesPath } from '../../routes/types'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { useCreateWallet } from '../../queries/use-create-wallet'
import { useLogIn } from '../../queries/use-login'
import { useEmailStore } from '../../store'
import { getInvitationInfoOptions } from '../../queries/use-get-invitation-info'
import { InviteTemplate } from './template'

export const Invite = () => {
  const search = useSearch({ from: AuthPagesPath.INVITE })
  const navigate = useNavigate()

  const createWallet = useCreateWallet({
    onSuccess: () => {
      navigate({ to: WalletPagesPath.HOME })
    },
  })
  const logIn = useLogIn({
    onSuccess: () => {
      navigate({ to: WalletPagesPath.HOME })
    },
  })
  const getInvitationInfo = useSuspenseQuery(getInvitationInfoOptions({ uniqueToken: search.token }))

  const isReturningUser = useMemo(() => getInvitationInfo.data.status === 'SUCCESS', [getInvitationInfo.data.status])
  const { email } = useEmailStore()

  const handleCreateWallet = () => {
    createWallet.mutate({ email: getInvitationInfo.data.email })
  }

  const handleLogIn = () => {
    if (!email) return navigate({ to: AuthPagesPath.LOGIN })

    logIn.mutate({ email })
  }

  const handleForgotPassword = () => {
    navigate({ to: AuthPagesPath.RECOVER })
  }

  return (
    <InviteTemplate
      isReturningUser={isReturningUser}
      isCreatingWallet={createWallet.isPending}
      isLoggingIn={createWallet.isPending}
      onCreateWallet={handleCreateWallet}
      onLogIn={handleLogIn}
      onForgotPassword={handleForgotPassword}
    />
  )
}
