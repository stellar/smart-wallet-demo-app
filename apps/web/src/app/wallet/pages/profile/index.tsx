import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { useAccessTokenStore } from 'src/app/auth/store'

import { ProfileTemplate } from './template'
import { useGetWallet } from '../../queries/use-get-wallet'
import { WalletPagesPath } from '../../routes/types'

export const Profile = () => {
  const navigate = useNavigate()
  const { clearAccessToken } = useAccessTokenStore()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  // Get wallet data from query
  const { data: walletData, isLoading: isLoadingProfile } = useGetWallet()

  // Extract data from the API response
  const email = walletData?.email || ''
  const fullWalletAddress = walletData?.address || ''

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  const handleSignOut = () => {
    // Clear session data and redirect to welcome page
    clearAccessToken()
  }

  return (
    <ProfileTemplate
      isLoadingProfile={isLoadingProfile}
      email={email}
      walletAddress={fullWalletAddress}
      onSignOut={handleSignOut}
      onGoBack={handleGoBack}
    />
  )
}
