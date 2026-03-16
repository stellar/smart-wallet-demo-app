import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { useTheme } from 'src/config/theme/provider'

import { InviteTemplate } from './template'
import { useCreateWallet } from '../../queries/use-create-wallet'
import { getInvitationInfoOptions } from '../../queries/use-get-invitation-info'
import { useLogIn } from '../../queries/use-login'
import { inviteRoute } from '../../routes'
import { AuthPagesPath } from '../../routes/types'

export const Invite = () => {
  const search = inviteRoute.useSearch()
  const navigate = useNavigate()
  const { onboardingStyleVariant } = useTheme()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

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
  const showTapToStart = useMemo(
    () => onboardingStyleVariant === 'stellar-house' && !isReturningUser && !hasStarted,
    [hasStarted, isReturningUser, onboardingStyleVariant]
  )

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

  const handleGetStarted = () => {
    setHasStarted(true)
  }

  // Reset transient invite page state when the token changes.
  useEffect(() => {
    setIsRedirecting(false)
    setHasStarted(false)
  }, [search.token])

  return (
    <InviteTemplate
      isReturningUser={isReturningUser}
      isCreatingWallet={createWallet.isPending || isRedirecting}
      isLoggingIn={logIn.isPending || isRedirecting}
      showTapToStart={showTapToStart}
      onGetStarted={handleGetStarted}
      onCreateWallet={handleCreateWallet}
      onLogIn={handleLogIn}
      onForgotPassword={handleForgotPassword}
    />
  )
}
