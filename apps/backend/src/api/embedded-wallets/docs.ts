import AirdropCompleteDocs from 'api/embedded-wallets/use-cases/airdrop-complete/index.docs'
import AirdropOptionsDocs from 'api/embedded-wallets/use-cases/airdrop-options/index.docs'
import CreateWalletDocs from 'api/embedded-wallets/use-cases/create-wallet/index.docs'
import CreateWalletOptionsDocs from 'api/embedded-wallets/use-cases/create-wallet-options/index.docs'
import GenerateRecoveryLinkDocs from 'api/embedded-wallets/use-cases/generate-recovery-link/index.docs'
import GetInvitationInfoDocs from 'api/embedded-wallets/use-cases/get-invitation-info/index.docs'
import GetWalletDocs from 'api/embedded-wallets/use-cases/get-wallet/index.docs'
import GetWalletHistoryDocs from 'api/embedded-wallets/use-cases/get-wallet-history/index.docs'
import ListNfts from 'api/embedded-wallets/use-cases/list-nft/index.docs'
import LogInDocs from 'api/embedded-wallets/use-cases/login/index.docs'
import LogInOptionsDocs from 'api/embedded-wallets/use-cases/login-options/index.docs'
import RecoverWalletDocs from 'api/embedded-wallets/use-cases/recover-wallet/index.docs'
import RecoverWalletOptionsDocs from 'api/embedded-wallets/use-cases/recover-wallet-options/index.docs'
import ResendInviteDocs from 'api/embedded-wallets/use-cases/resend-invite/index.docs'
import TransferDocs from 'api/embedded-wallets/use-cases/transfer/index.docs'
import TransferOptionsDocs from 'api/embedded-wallets/use-cases/transfer-options/index.docs'
import ValidateRecoveryLinkDocs from 'api/embedded-wallets/use-cases/validate-recovery-link/index.docs'

export default {
  '/api/embedded-wallets': {
    ...GetWalletDocs,
  },
  '/api/embedded-wallets/tx-history': {
    ...GetWalletHistoryDocs,
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
  '/api/embedded-wallets/send-recovery-link': {
    ...GenerateRecoveryLinkDocs,
  },
  '/api/embedded-wallets/validate-recovery-link': {
    ...ValidateRecoveryLinkDocs,
  },
  '/api/embedded-wallets/recover/options/{code}': {
    ...RecoverWalletOptionsDocs,
  },
  '/api/embedded-wallets/recover/complete': {
    ...RecoverWalletDocs,
  },
  '/api/embedded-wallets/resend-invite': {
    ...ResendInviteDocs,
  },
  '/api/embedded-wallets/nft': {
    ...ListNfts,
  }
  '/api/embedded-wallets/transfer/options': {
    ...TransferOptionsDocs,
  },
  '/api/embedded-wallets/transfer/complete': {
    ...TransferDocs,
  },
  '/api/embedded-wallets/airdrop/options': {
    ...AirdropOptionsDocs,
  },
  '/api/embedded-wallets/airdrop/complete': {
    ...AirdropCompleteDocs,
  },
}
