import { Router } from 'express'
import { GetInvitationInfo, endpoint as GetInvitationInfoEndpoint } from './use-cases/get-invitation-info'
import { CreateWalletOptions, endpoint as CreateWalletOptionsEndpoint } from './use-cases/create-wallet-options'
import { CreateWallet, endpoint as CreateWalletEndpoint } from './use-cases/create-wallet'
import { LogInOptions, endpoint as LogInOptionsEndpoint } from './use-cases/login-options'
import { LogIn, endpoint as LogInEndpoint } from './use-cases/login'

const router = Router()

router.get(`${GetInvitationInfoEndpoint}`, async (req, res) => GetInvitationInfo.init().executeHttp(req, res))
router.get(`${CreateWalletOptionsEndpoint}`, async (req, res) => CreateWalletOptions.init().executeHttp(req, res))
router.post(`${CreateWalletEndpoint}`, async (req, res) => CreateWallet.init().executeHttp(req, res))
router.get(`${LogInOptionsEndpoint}`, async (req, res) => LogInOptions.init().executeHttp(req, res))
router.post(`${LogInEndpoint}`, async (req, res) => LogIn.init().executeHttp(req, res))

export default router
