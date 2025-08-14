import { Router } from 'express'

import { apiKeyAuthentication } from 'api/core/middlewares/api-key-authentication'

import { CreateFeatureFlag, endpoint as CreateFeatureFlagEndpoint } from './use-cases/create-feature-flag'
import { GetFeatureFlags, endpoint as GetFeatureFlagsEndpoint } from './use-cases/get-feature-flags'
import { UpdateFeatureFlag, endpoint as UpdateFeatureFlagEndpoint } from './use-cases/update-feature-flag'

const router = Router()
router.get(`${GetFeatureFlagsEndpoint}`, apiKeyAuthentication, async (req, res) =>
  GetFeatureFlags.init().executeHttp(req, res)
)

const adminRouter = Router()
adminRouter.get(`${GetFeatureFlagsEndpoint}`, apiKeyAuthentication, async (req, res) =>
  GetFeatureFlags.init().executeHttp(req, res)
)
adminRouter.post(`${CreateFeatureFlagEndpoint}`, apiKeyAuthentication, async (req, res) =>
  CreateFeatureFlag.init().executeHttp(req, res)
)
adminRouter.patch(`${UpdateFeatureFlagEndpoint}`, apiKeyAuthentication, async (req, res) =>
  UpdateFeatureFlag.init().executeHttp(req, res)
)

export { router, adminRouter }
