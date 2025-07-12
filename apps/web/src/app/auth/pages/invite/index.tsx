import { useState } from 'react'
import { InviteTemplate } from './template'
import { useNavigate } from '@tanstack/react-router'
import { AuthPagesPath } from '../../routes/types'

export const Invite = () => {
  // TODO: manage returning user state
  const [isReturningUser] = useState(false)

  const navigate = useNavigate()

  const handleCreateWallet = () => {
    throw new Error('Function not implemented.')
  }

  const handleLogIn = () => {
    throw new Error('Function not implemented.')
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
