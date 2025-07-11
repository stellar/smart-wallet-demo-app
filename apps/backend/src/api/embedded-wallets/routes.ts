import { Router } from 'express'
import { GetInvitationInfo, endpoint as GetInvitationInfoEndpoint } from './use-cases/get-invitation-info'

const router = Router()

router.get(`${GetInvitationInfoEndpoint}`, async (req, res) => GetInvitationInfo.init().executeHttp(req, res))

export default router
