import { IHTTPResponse } from 'src/interfaces/http/types'

export type FeatureFlags = 'coming-soon' | 'airdrop' | 'transfer-left-assets'

export interface IGeneralSettingsService {
  getFeatureFlags: () => Promise<GetFeatureFlagsResult>
}

export type GetFeatureFlagsResult = IHTTPResponse<{
  flags: {
    name: FeatureFlags
    is_active: boolean
    metadata?: Record<string, unknown>
  }[]
}>
