import { Tags } from 'api/core/utils/docs/tags'
import CreateAssetDocs from 'api/general-settings/use-cases/create-asset/index.docs'
import CreateFeatureFlagsDocs from 'api/general-settings/use-cases/create-feature-flag/index.docs'
import CreateNgoDocs from 'api/general-settings/use-cases/create-ngo/index.docs'
import CreateProductDocs from 'api/general-settings/use-cases/create-product/index.docs'
import CreateVendorDocs from 'api/general-settings/use-cases/create-vendor/index.docs'
import GetAssetsDocs from 'api/general-settings/use-cases/get-assets/index.docs'
import GetFeatureFlagsDocs from 'api/general-settings/use-cases/get-feature-flags/index.docs'
import GetNgosDocs from 'api/general-settings/use-cases/get-ngos/index.docs'
import GetProductsDocs from 'api/general-settings/use-cases/get-products/index.docs'
import GetVendorsDocs from 'api/general-settings/use-cases/get-vendors/index.docs'
import UpdateAssetDocs from 'api/general-settings/use-cases/update-asset/index.docs'
import UpdateFeatureFlagDocs from 'api/general-settings/use-cases/update-feature-flag/index.docs'
import UpdateNgoDocs from 'api/general-settings/use-cases/update-ngo/index.docs'
import UpdateProductDocs from 'api/general-settings/use-cases/update-product/index.docs'
import UpdateVendorDocs from 'api/general-settings/use-cases/update-vendor/index.docs'

export default {
  '/api/feature-flags': {
    get: {
      ...GetFeatureFlagsDocs.get,
      tags: [Tags.FEATURE_FLAGS],
    },
  },
  '/api/admin/feature-flags': {
    get: {
      ...GetFeatureFlagsDocs.get,
      tags: [Tags.ADMIN],
    },
    ...CreateFeatureFlagsDocs,
  },
  '/api/admin/feature-flags/{id}': {
    ...UpdateFeatureFlagDocs,
  },
  '/api/admin/assets': {
    ...GetAssetsDocs,
    ...CreateAssetDocs,
  },
  '/api/admin/assets/{id}': {
    ...UpdateAssetDocs,
  },
  '/api/admin/vendors': {
    ...GetVendorsDocs,
    ...CreateVendorDocs,
  },
  '/api/admin/vendors/{id}': {
    ...UpdateVendorDocs,
  },
  '/api/admin/products': {
    ...GetProductsDocs,
    ...CreateProductDocs,
  },
  '/api/admin/products/{id}': {
    ...UpdateProductDocs,
  },
  '/api/ngos': {
    get: {
      ...GetNgosDocs.get,
      tags: [Tags.NGOS],
    },
  },
  '/api/admin/ngos': {
    get: {
      ...GetNgosDocs.get,
      tags: [Tags.ADMIN],
    },
    ...CreateNgoDocs,
  },
  '/api/admin/ngos/{id}': {
    ...UpdateNgoDocs,
  },
}
