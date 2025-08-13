import { Tags } from 'api/core/utils/docs/tags'
import CreateFeatureFlagsDocs from 'api/feature-flags/use-cases/create-feature-flag/index.docs'
import GetFeatureFlagsDocs from 'api/feature-flags/use-cases/get-feature-flags/index.docs'
import UpdateFeatureFlagDocs from 'api/feature-flags/use-cases/update-feature-flag/index.docs'

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
  '/api/admin/feature-flags/:id': {
    ...UpdateFeatureFlagDocs,
  },
}
