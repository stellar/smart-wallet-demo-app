import { useNavigate } from '@tanstack/react-router'

import { AuthPagesPath } from 'src/app/auth/routes/types'
import { OnboardingStyleVariant } from 'src/constants/theme/onboarding-style'

import { WelcomeTemplate } from './template'

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
      onboardingStyleVariant={import.meta.env.VITE_ONBOARDING_STYLE_VARIANT as OnboardingStyleVariant}
      onCreateWallet={handleCreateWallet}
      onLogIn={handleLogIn}
      onForgotPassword={handleForgotPassword}
    />
  )
}
