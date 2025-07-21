import { Router } from 'express'

import { CreateWallet, endpoint as CreateWalletEndpoint } from './use-cases/create-wallet'
import { CreateWalletOptions, endpoint as CreateWalletOptionsEndpoint } from './use-cases/create-wallet-options'
import { GetInvitationInfo, endpoint as GetInvitationInfoEndpoint } from './use-cases/get-invitation-info'
import { GetWallet, endpoint as GetWalletEndpoint } from './use-cases/get-wallet'
import { LogIn, endpoint as LogInEndpoint } from './use-cases/login'
import { LogInOptions, endpoint as LogInOptionsEndpoint } from './use-cases/login-options'

const router = Router()

router.get(`${GetInvitationInfoEndpoint}`, async (req, res) => GetInvitationInfo.init().executeHttp(req, res))
router.get(`${CreateWalletOptionsEndpoint}`, async (req, res) => CreateWalletOptions.init().executeHttp(req, res))
router.post(`${CreateWalletEndpoint}`, async (req, res) => CreateWallet.init().executeHttp(req, res))
router.get(`${LogInOptionsEndpoint}`, async (req, res) => LogInOptions.init().executeHttp(req, res))
router.post(`${LogInEndpoint}`, async (req, res) => LogIn.init().executeHttp(req, res))
router.get(
  `${GetWalletEndpoint}`,
  /* TODO: use authMiddleware here ,*/ async (req, res) => GetWallet.init().executeHttp(req, res)
)

export default router
