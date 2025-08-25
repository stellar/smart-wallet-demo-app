import { Router } from 'express'

import { apiKeyAuthentication } from 'api/core/middlewares/api-key-authentication'

import { CreateAsset, endpoint as CreateAssetEndpoint } from './use-cases/create-asset'
import { CreateFeatureFlag, endpoint as CreateFeatureFlagEndpoint } from './use-cases/create-feature-flag'
import { CreateNftSupply, endpoint as CreateNftSupplyEndpoint } from './use-cases/create-nft-supply'
import { CreateVendor, endpoint as CreateVendorEndpoint } from './use-cases/create-vendor'
import { GetAssets, endpoint as GetAssetsEndpoint } from './use-cases/get-assets'
import { GetFeatureFlags, endpoint as GetFeatureFlagsEndpoint } from './use-cases/get-feature-flags'
import { GetNftSupply, endpoint as GetNftSupplyEndpoint } from './use-cases/get-nft-supply'
import { GetVendors, endpoint as GetVendorsEndpoint } from './use-cases/get-vendors'
import { UpdateAsset, endpoint as UpdateAssetEndpoint } from './use-cases/update-asset'
import { UpdateFeatureFlag, endpoint as UpdateFeatureFlagEndpoint } from './use-cases/update-feature-flag'
import { UpdateNftSupply, endpoint as UpdateNftSupplyEndpoint } from './use-cases/update-nft-supply'
import { UpdateVendor, endpoint as UpdateVendorEndpoint } from './use-cases/update-vendor'

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

const adminNftSupplyRoutes = Router()
adminNftSupplyRoutes.get(`${GetNftSupplyEndpoint}`, apiKeyAuthentication, async (req, res) =>
  GetNftSupply.init().executeHttp(req, res)
)
adminNftSupplyRoutes.post(`${CreateNftSupplyEndpoint}`, apiKeyAuthentication, async (req, res) =>
  CreateNftSupply.init().executeHttp(req, res)
)
adminNftSupplyRoutes.patch(`${UpdateNftSupplyEndpoint}`, apiKeyAuthentication, async (req, res) =>
  UpdateNftSupply.init().executeHttp(req, res)
)

const adminVendorsRoutes = Router()
adminVendorsRoutes.get(`${GetVendorsEndpoint}`, apiKeyAuthentication, async (req, res) =>
  GetVendors.init().executeHttp(req, res)
)
adminVendorsRoutes.post(`${CreateVendorEndpoint}`, apiKeyAuthentication, async (req, res) =>
  CreateVendor.init().executeHttp(req, res)
)
adminVendorsRoutes.patch(`${UpdateVendorEndpoint}`, apiKeyAuthentication, async (req, res) =>
  UpdateVendor.init().executeHttp(req, res)
)

export { featureFlagsRoutes, adminFeatureFlagsRoutes, adminAssetsRoutes, adminNftSupplyRoutes, adminVendorsRoutes }
