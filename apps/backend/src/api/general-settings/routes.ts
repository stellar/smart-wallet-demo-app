import { Router } from 'express'

import { apiKeyAuthentication } from 'api/core/middlewares/api-key-authentication'

import { CreateAsset, endpoint as CreateAssetEndpoint } from './use-cases/create-asset'
import { CreateFeatureFlag, endpoint as CreateFeatureFlagEndpoint } from './use-cases/create-feature-flag'
import { GetAssets, endpoint as GetAssetsEndpoint } from './use-cases/get-assets'
import { GetFeatureFlags, endpoint as GetFeatureFlagsEndpoint } from './use-cases/get-feature-flags'
import { UpdateAsset, endpoint as UpdateAssetEndpoint } from './use-cases/update-asset'
import { UpdateFeatureFlag, endpoint as UpdateFeatureFlagEndpoint } from './use-cases/update-feature-flag'

const featureFlagsRoutes = Router()
featureFlagsRoutes.get(`${GetFeatureFlagsEndpoint}`, apiKeyAuthentication, async (req, res) =>
  GetFeatureFlags.init().executeHttp(req, res)
)

const adminFeatureFlagsRoutes = Router()
adminFeatureFlagsRoutes.get(`${GetFeatureFlagsEndpoint}`, apiKeyAuthentication, async (req, res) =>
  GetFeatureFlags.init().executeHttp(req, res)
)
adminFeatureFlagsRoutes.post(`${CreateFeatureFlagEndpoint}`, apiKeyAuthentication, async (req, res) =>
  CreateFeatureFlag.init().executeHttp(req, res)
)
adminFeatureFlagsRoutes.patch(`${UpdateFeatureFlagEndpoint}`, apiKeyAuthentication, async (req, res) =>
  UpdateFeatureFlag.init().executeHttp(req, res)
)

const adminAssetsRoutes = Router()
adminAssetsRoutes.get(`${GetAssetsEndpoint}`, apiKeyAuthentication, async (req, res) =>
  GetAssets.init().executeHttp(req, res)
)
adminAssetsRoutes.post(`${CreateAssetEndpoint}`, apiKeyAuthentication, async (req, res) =>
  CreateAsset.init().executeHttp(req, res)
)
adminAssetsRoutes.patch(`${UpdateAssetEndpoint}`, apiKeyAuthentication, async (req, res) =>
  UpdateAsset.init().executeHttp(req, res)
)

export { featureFlagsRoutes, adminFeatureFlagsRoutes, adminAssetsRoutes }
