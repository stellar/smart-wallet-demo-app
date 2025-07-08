import { useNavigate } from '@tanstack/react-router'
import { HomeTemplate } from './template'
import { AuthPagesPath } from 'src/app/auth/routes/types'

export const Home = () => {
  const navigate = useNavigate()

  const handleCreateWallet = () => {
    throw new Error('Function not implemented.')
  }

  const handleLogIn = () => {
    navigate({ to: AuthPagesPath.INVITE_RESEND })
  }

  const handleForgotPassword = () => {
    navigate({ to: AuthPagesPath.RECOVER })
  }

  return (
    <HomeTemplate onCreateWallet={handleCreateWallet} onLogIn={handleLogIn} onForgotPassword={handleForgotPassword} />
  )
}
