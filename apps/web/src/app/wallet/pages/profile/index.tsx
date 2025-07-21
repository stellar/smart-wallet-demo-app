import { useNavigate } from '@tanstack/react-router'

import { AuthPagesPath } from 'src/app/auth/routes/types'
import { useAccessTokenStore, useEmailStore } from 'src/app/auth/store'

import { ProfileTemplate } from './template'

export const Profile = () => {
  const navigate = useNavigate()
  const { clearAccessToken } = useAccessTokenStore()
  const { clearEmail } = useEmailStore()

  // Static data for now
  const email = 'email@test.org'
  const fullWalletAddress = 'CJKSJU2N9M1EXAMPLEFULLADDRESS'

  const handleSignOut = () => {
    // Clear session data
    clearAccessToken()
    clearEmail()

    // Navigate to welcome page
    navigate({ to: AuthPagesPath.WELCOME })
  }

  // Validate required data
  if (!email || !fullWalletAddress) {
    // TODO: Handle missing data - could redirect to login or show error
    return null
  }

  return <ProfileTemplate email={email} walletAddress={fullWalletAddress} onSignOut={handleSignOut} />
}
