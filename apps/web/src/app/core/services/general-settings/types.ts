import { IHTTPResponse } from 'src/interfaces/http/types'

export type FeatureFlags =
  | 'coming-soon'
  | 'airdrop'
  | 'transfer-left-assets'
  | 'behind-scenes'
  | 'left-swags'
  | 'wallet-coming-soon'
  | 'products-list'
  | 'vendors-list'

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
