import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { AuthPagesPath } from 'src/app/auth/routes/types'
import { useAccessTokenStore, useEmailStore } from 'src/app/auth/store'

import { ProfileTemplate } from './template'
import { useGetWallet } from '../../queries/use-get-wallet'
import { WalletPagesPath } from '../../routes/types'
import { useWalletAddressStore } from '../../store'

export const Profile = () => {
  const navigate = useNavigate()
  const { clearAccessToken } = useAccessTokenStore()
  const { clearEmail } = useEmailStore()
  const { clearWalletAddress } = useWalletAddressStore()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  // Get wallet data from query
  const { data: walletData, isPending: isLoadingProfile } = useGetWallet()

  // Extract data from the API response
  const email = walletData?.email || ''
  const fullWalletAddress = walletData?.address || ''

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  const handleSignOut = () => {
    // Clear session data and redirect to welcome page
    clearAccessToken(AuthPagesPath.WELCOME)
    clearEmail()
    clearWalletAddress()
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
