import { Tags } from 'api/core/utils/docs/tags'
import CreateFeatureFlagsDocs from 'api/general-settings/use-cases/create-feature-flag/index.docs'
import GetFeatureFlagsDocs from 'api/general-settings/use-cases/get-feature-flags/index.docs'
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
}
