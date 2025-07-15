import GetInvitationInfoDocs from 'api/embedded-wallets/use-cases/get-invitation-info/index.docs'

export default {
  '/api/embedded-wallets/invitation-info/{token}': {
    ...GetInvitationInfoDocs,
  },
}
