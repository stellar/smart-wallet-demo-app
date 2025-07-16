import { Router } from 'express'
import { GetInvitationInfo, endpoint as GetInvitationInfoEndpoint } from './use-cases/get-invitation-info'
import { CreateWalletOptions, endpoint as CreateWalletOptionsEndpoint } from './use-cases/create-wallet-options'
import { CreateWallet, endpoint as CreateWalletEndpoint } from './use-cases/create-wallet'

const router = Router()

router.get(`${GetInvitationInfoEndpoint}`, async (req, res) => GetInvitationInfo.init().executeHttp(req, res))
router.get(`${CreateWalletOptionsEndpoint}`, async (req, res) => CreateWalletOptions.init().executeHttp(req, res))
router.post(`${CreateWalletEndpoint}`, async (req, res) => CreateWallet.init().executeHttp(req, res))

export default router
