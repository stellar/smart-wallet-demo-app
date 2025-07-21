import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { InviteTemplate } from './template'
import { useCreateWallet } from '../../queries/use-create-wallet'
import { getInvitationInfoOptions } from '../../queries/use-get-invitation-info'
import { useLogIn } from '../../queries/use-login'
import { AuthPagesPath } from '../../routes/types'

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
  const email = useMemo(() => getInvitationInfo.data.email, [getInvitationInfo.data.email])

  const handleCreateWallet = () => {
    if (!email) return navigate({ to: AuthPagesPath.INVITE_RESEND })

    createWallet.mutate({ email })
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
