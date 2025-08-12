import { IHTTPResponse } from 'src/interfaces/http/types'

export type FeatureFlags = 'coming-soon' | 'airdrop'

export interface ISettingsService {
  getFeatureFlags: () => Promise<GetFeatureFlagsResult>
}

export type GetFeatureFlagsResult = IHTTPResponse<{
  flags: {
    name: FeatureFlags
    value: boolean
    metadata?: Record<string, unknown>
  }[]
}>
