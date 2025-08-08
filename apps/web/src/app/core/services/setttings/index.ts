import { GetFeatureFlagsResult, ISettingsService } from './types'

export class SettingsService implements ISettingsService {
  async getFeatureFlags(): Promise<GetFeatureFlagsResult> {
    // TODO: add API endpoint integration
    return {
      data: {
        flags: [
          { name: 'airdrop', value: true },
          { name: 'coming-soon', value: false },
        ],
      },
      message: 'abc',
    }
  }
}

const settingsService = new SettingsService()

export { settingsService }
