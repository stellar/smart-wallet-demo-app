import { useNavigate } from '@tanstack/react-router'
import { WelcomeTemplate } from './template'
import { AuthPagesPath } from 'src/app/auth/routes/types'

export const Welcome = () => {
  const navigate = useNavigate()

  const handleCreateWallet = () => {
    navigate({ to: AuthPagesPath.INVITE_RESEND })
  }

  const handleLogIn = () => {
    navigate({ to: AuthPagesPath.LOGIN })
  }

  const handleForgotPassword = () => {
    navigate({ to: AuthPagesPath.RECOVER })
  }

  return (
    <WelcomeTemplate
      onCreateWallet={handleCreateWallet}
      onLogIn={handleLogIn}
      onForgotPassword={handleForgotPassword}
    />
  )
}
