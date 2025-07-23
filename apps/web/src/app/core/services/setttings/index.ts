import { GetFeatureFlagsResult, ISettingsService } from './types'

export class SettingsService implements ISettingsService {
  async getFeatureFlags(): Promise<GetFeatureFlagsResult> {
    // TODO: add API endpoint integration
    return {
      data: {
        flags: { ['airdrop']: true, ['coming-soon']: false },
        success: true,
      },
      message: 'abc',
    }
  }
}

const settingsService = new SettingsService()

export { settingsService }
