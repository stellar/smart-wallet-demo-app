import GetInvitationInfoDocs from 'api/embedded-wallets/use-cases/get-invitation-info/index.docs'
import CreateWalletOptionsDocs from 'api/embedded-wallets/use-cases/create-wallet-options/index.docs'
import CreateWalletDocs from 'api/embedded-wallets/use-cases/create-wallet/index.docs'

export default {
  '/api/embedded-wallets/invitation-info/{token}': {
    ...GetInvitationInfoDocs,
  },
  '/api/embedded-wallets/register/options': {
    ...CreateWalletOptionsDocs,
  },
  '/api/embedded-wallets/register/complete': {
    ...CreateWalletDocs,
  },
}
