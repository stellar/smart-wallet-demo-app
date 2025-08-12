import { Router } from 'express'

import { authentication } from 'api/core/middlewares/authentication'

import { AirdropComplete, endpoint as AirdropCompleteEndpoint } from './use-cases/airdrop-complete'
import { AirdropOptions, endpoint as AirdropOptionsEndpoint } from './use-cases/airdrop-options'
import { CreateWallet, endpoint as CreateWalletEndpoint } from './use-cases/create-wallet'
import { CreateWalletOptions, endpoint as CreateWalletOptionsEndpoint } from './use-cases/create-wallet-options'
import { GenerateRecoveryLink, endpoint as GenerateRecoveryLinkEndpoint } from './use-cases/generate-recovery-link'
import { GetInvitationInfo, endpoint as GetInvitationInfoEndpoint } from './use-cases/get-invitation-info'
import { GetWallet, endpoint as GetWalletEndpoint } from './use-cases/get-wallet'
import { GetWalletHistory, endpoint as GetWalletHistoryEndpoint } from './use-cases/get-wallet-history'
import { LogIn, endpoint as LogInEndpoint } from './use-cases/login'
import { LogInOptions, endpoint as LogInOptionsEndpoint } from './use-cases/login-options'
import { RecoverWallet, endpoint as RecoverWalletEndpoint } from './use-cases/recover-wallet'
import { RecoverWalletOptions, endpoint as RecoverWalletOptionsEndpoint } from './use-cases/recover-wallet-options'
import { ResendInvite, endpoint as ResendInviteEndpoint } from './use-cases/resend-invite'
import { Transfer, endpoint as TransferEndpoint } from './use-cases/transfer'
import { TransferOptions, endpoint as TransferOptionsEndpoint } from './use-cases/transfer-options'
import { ValidateRecoveryLink, endpoint as ValidateRecoveryLinkEndpoint } from './use-cases/validate-recovery-link'

const router = Router()

router.get(`${GetInvitationInfoEndpoint}`, async (req, res) => GetInvitationInfo.init().executeHttp(req, res))
router.get(`${CreateWalletOptionsEndpoint}`, async (req, res) => CreateWalletOptions.init().executeHttp(req, res))
router.post(`${CreateWalletEndpoint}`, async (req, res) => CreateWallet.init().executeHttp(req, res))
router.get(`${LogInOptionsEndpoint}`, async (req, res) => LogInOptions.init().executeHttp(req, res))
router.post(`${LogInEndpoint}`, async (req, res) => LogIn.init().executeHttp(req, res))
router.get(`${GetWalletEndpoint}`, authentication, async (req, res) => GetWallet.init().executeHttp(req, res))
router.get(`${GetWalletHistoryEndpoint}`, authentication, async (req, res) =>
  GetWalletHistory.init().executeHttp(req, res)
)
router.post(`${GenerateRecoveryLinkEndpoint}`, async (req, res) => GenerateRecoveryLink.init().executeHttp(req, res))
router.post(`${ValidateRecoveryLinkEndpoint}`, async (req, res) => ValidateRecoveryLink.init().executeHttp(req, res))
router.get(`${RecoverWalletOptionsEndpoint}`, async (req, res) => RecoverWalletOptions.init().executeHttp(req, res))
router.post(`${RecoverWalletEndpoint}`, async (req, res) => RecoverWallet.init().executeHttp(req, res))
router.post(`${ResendInviteEndpoint}`, async (req, res) => ResendInvite.init().executeHttp(req, res))
router.get(`${TransferOptionsEndpoint}`, authentication, async (req, res) =>
  TransferOptions.init().executeHttp(req, res)
)
router.post(`${TransferEndpoint}`, authentication, async (req, res) => Transfer.init().executeHttp(req, res))
router.get(`${AirdropOptionsEndpoint}`, authentication, async (req, res) => AirdropOptions.init().executeHttp(req, res))
router.post(`${AirdropCompleteEndpoint}`, authentication, async (req, res) =>
  AirdropComplete.init().executeHttp(req, res)
)

export default router
