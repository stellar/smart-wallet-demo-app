import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { AuthPagesPath } from 'src/app/auth/routes/types'
import { useAccessTokenStore, useEmailStore } from 'src/app/auth/store'

import { ProfileTemplate } from './template'
import { WalletPagesPath } from '../../routes/types'
import { getWallet } from '../../queries/use-get-wallet'

export const Profile = () => {
  const navigate = useNavigate()
  const { clearAccessToken } = useAccessTokenStore()
  const { clearEmail } = useEmailStore()
  const canGoBack = useCanGoBack()
  const router = useRouter()
  
  // Get wallet data using suspense query
  const walletData = useSuspenseQuery(getWallet())
  
  // Extract data from the API response
  const email = walletData.data.data.email || ''
  const fullWalletAddress = walletData.data.data.address || ''

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  const handleSignOut = () => {
    // Clear session data and redirect to welcome page
    clearAccessToken(AuthPagesPath.WELCOME)
    clearEmail()
  }

  // Validate required data
  if (!email || !fullWalletAddress) {
    // TODO: Handle missing data - could redirect to login or show error
    return null
  }

  return (
    <ProfileTemplate
      email={email}
      walletAddress={fullWalletAddress}
      onSignOut={handleSignOut}
      onGoBack={handleGoBack}
    />
  )
}
