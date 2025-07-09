import { useNavigate } from '@tanstack/react-router'
import { HomeTemplate } from './template'
import { AuthPagesPath } from 'src/app/auth/routes/types'

export const Home = () => {
  const navigate = useNavigate()

  const handleCreateWallet = () => {
    navigate({ to: AuthPagesPath.INVITE_RESEND })
  }

  const handleLogIn = () => {
    throw new Error('Function not implemented.')
  }

  const handleForgotPassword = () => {
    navigate({ to: AuthPagesPath.RECOVER })
  }

  return (
    <HomeTemplate onCreateWallet={handleCreateWallet} onLogIn={handleLogIn} onForgotPassword={handleForgotPassword} />
  )
}
