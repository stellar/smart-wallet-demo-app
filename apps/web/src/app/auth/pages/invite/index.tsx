import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { InviteTemplate } from './template'
import { useCreateWallet } from '../../queries/use-create-wallet'
import { getInvitationInfoOptions } from '../../queries/use-get-invitation-info'
import { useLogIn } from '../../queries/use-login'
import { inviteRoute } from '../../routes'
import { AuthPagesPath } from '../../routes/types'

export const Invite = () => {
  const search = inviteRoute.useSearch()
  const navigate = useNavigate()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const createWallet = useCreateWallet({
    onSuccess: () => {
      setIsRedirecting(true)
    },
  })
  const logIn = useLogIn({
    onSuccess: () => {
      setIsRedirecting(true)
    },
  })
  const getInvitationInfo = useSuspenseQuery(getInvitationInfoOptions({ uniqueToken: search.token }))

  const isReturningUser = useMemo(() => getInvitationInfo.data.status === 'SUCCESS', [getInvitationInfo.data.status])
  const email = useMemo(() => getInvitationInfo.data.email, [getInvitationInfo.data.email])

  const handleCreateWallet = () => {
    if (!search.token) return navigate({ to: AuthPagesPath.INVITE_RESEND })

    createWallet.mutate({ invitationToken: search.token })
  }

  const handleLogIn = () => {
    if (!email) return navigate({ to: AuthPagesPath.LOGIN })

    logIn.mutate({ email })
  }

  const handleForgotPassword = () => {
    navigate({ to: AuthPagesPath.RECOVER })
  }

  // Reset redirecting state when component mounts
  useEffect(() => {
    setIsRedirecting(false)
  }, [])

  return (
    <InviteTemplate
      isReturningUser={isReturningUser}
      isCreatingWallet={createWallet.isPending || isRedirecting}
      isLoggingIn={logIn.isPending || isRedirecting}
      onCreateWallet={handleCreateWallet}
      onLogIn={handleLogIn}
      onForgotPassword={handleForgotPassword}
    />
  )
}
