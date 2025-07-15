import { useState } from 'react'
import { InviteTemplate } from './template'
import { useNavigate, useParams } from '@tanstack/react-router'
import { AuthPagesPath } from '../../routes/types'
import { useCreateWallet } from '../../queries/use-create-wallet'
import { useLogIn } from '../../queries/use-log-in'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getInvitationInfoOptions } from '../../queries/use-get-invitation-info'

export const Invite = () => {
  const [isReturningUser] = useState(false)

  const params = useParams({ from: AuthPagesPath.INVITE })
  const navigate = useNavigate()

  const createWallet = useCreateWallet()
  const logIn = useLogIn()
  const getInvitationInfo = useSuspenseQuery(getInvitationInfoOptions({ uniqueToken: params.uniqueToken }))

  const handleCreateWallet = async () => {
    createWallet.mutate({ email: getInvitationInfo.data.email })
  }

  const handleLogIn = () => {
    logIn.mutate({ email: getInvitationInfo.data.email })
  }

  const handleForgotPassword = () => {
    navigate({ to: AuthPagesPath.RECOVER })
  }

  return (
    <InviteTemplate
      isReturningUser={isReturningUser}
      onCreateWallet={handleCreateWallet}
      onLogIn={handleLogIn}
      onForgotPassword={handleForgotPassword}
    />
  )
}
