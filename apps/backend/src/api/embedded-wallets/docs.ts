import CreateWalletDocs from 'api/embedded-wallets/use-cases/create-wallet/index.docs'
import CreateWalletOptionsDocs from 'api/embedded-wallets/use-cases/create-wallet-options/index.docs'
import GetInvitationInfoDocs from 'api/embedded-wallets/use-cases/get-invitation-info/index.docs'
import GetWalletDocs from 'api/embedded-wallets/use-cases/get-wallet/index.docs'
import LogInDocs from 'api/embedded-wallets/use-cases/login/index.docs'
import LogInOptionsDocs from 'api/embedded-wallets/use-cases/login-options/index.docs'

export default {
  '/api/embedded-wallets': {
    ...GetWalletDocs,
  },
  '/api/embedded-wallets/invitation-info/{token}': {
    ...GetInvitationInfoDocs,
  },
  '/api/embedded-wallets/register/options/{email}': {
    ...CreateWalletOptionsDocs,
  },
  '/api/embedded-wallets/register/complete': {
    ...CreateWalletDocs,
  },
  '/api/embedded-wallets/login/options/{email}': {
    ...LogInOptionsDocs,
  },
  '/api/embedded-wallets/login/complete': {
    ...LogInDocs,
  },
}
