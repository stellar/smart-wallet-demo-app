import { Tags } from 'api/core/utils/docs/tags'
import CreateAssetDocs from 'api/general-settings/use-cases/create-asset/index.docs'
import CreateFeatureFlagsDocs from 'api/general-settings/use-cases/create-feature-flag/index.docs'
import GetAssetsDocs from 'api/general-settings/use-cases/get-assets/index.docs'
import GetFeatureFlagsDocs from 'api/general-settings/use-cases/get-feature-flags/index.docs'
import UpdateAssetDocs from 'api/general-settings/use-cases/update-asset/index.docs'
import UpdateFeatureFlagDocs from 'api/general-settings/use-cases/update-feature-flag/index.docs'

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
}
