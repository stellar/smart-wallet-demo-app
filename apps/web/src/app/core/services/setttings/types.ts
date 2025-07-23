import { IHTTPResponse } from 'src/interfaces/http/types'

export type FeatureFlags = 'coming-soon' | 'airdrop'

export interface ISettingsService {
  getFeatureFlags: () => Promise<GetFeatureFlagsResult>
}

export type GetFeatureFlagsResult = IHTTPResponse<{ flags: Record<FeatureFlags, boolean> }>
