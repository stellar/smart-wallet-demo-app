import { Router } from 'express'

import { authentication } from 'api/core/middlewares/authentication'

import { GetProofByAddress, endpoint as GetProofByAddressEndpoint } from './use-cases/get-proof-by-address'

const router = Router()

router.get(`${GetProofByAddressEndpoint}`, authentication, async (req, res) =>
  GetProofByAddress.init().executeHttp(req, res)
)

export default router
