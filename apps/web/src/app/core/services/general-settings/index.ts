import { http } from 'src/interfaces/http'

import { GetFeatureFlagsResult, IGeneralSettingsService } from './types'

export class GeneralSettingsService implements IGeneralSettingsService {
  async getFeatureFlags(): Promise<GetFeatureFlagsResult> {
    const response = await http.get('/api/feature-flags')

    return response.data
  }
}

const generalSettingsService = new GeneralSettingsService()

export { generalSettingsService }
