import GetInvitationInfoDocs from 'api/embedded-wallets/use-cases/get-invitation-info/index.docs'
import CreateWalletDocs from 'api/embedded-wallets/use-cases/create-wallet/index.docs'

export default {
  '/api/embedded-wallets/invitation-info/{token}': {
    ...GetInvitationInfoDocs,
  },
  '/api/embedded-wallets': {
    ...CreateWalletDocs,
  },
}
