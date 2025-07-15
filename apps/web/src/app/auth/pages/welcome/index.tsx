import { useNavigate } from '@tanstack/react-router'
import { WelcomeTemplate } from './template'
import { AuthPagesPath } from 'src/app/auth/routes/types'
import { useLogIn } from '../../queries/use-log-in'
import { useEmailStore } from '../../store'

export const Welcome = () => {
  const navigate = useNavigate()

  const logIn = useLogIn()
  const { email } = useEmailStore()

  const handleCreateWallet = () => {
    navigate({ to: AuthPagesPath.INVITE_RESEND })
  }

  const handleLogIn = () => {
    if (email) logIn.mutate({ email })
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
