import { ProfileTemplate } from './template'

export const Profile = () => {
  // Static data for now
  const email = 'email@test.org'
  const fullWalletAddress = 'CJKSJU2N9M1EXAMPLEFULLADDRESS'

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    // For now, just a placeholder
  }

  // Validate required data
  if (!email || !fullWalletAddress) {
    // TODO: Handle missing data - could redirect to login or show error
    return null
  }

  return <ProfileTemplate email={email} walletAddress={fullWalletAddress} onSignOut={handleSignOut} />
}
