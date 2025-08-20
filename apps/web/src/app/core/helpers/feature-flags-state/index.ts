import { CoreQueryKeys } from 'src/app/core/queries/query-keys'
import { FeatureFlags, GetFeatureFlagsResult } from 'src/app/core/services/general-settings/types'
import { queryClient } from 'src/interfaces/query-client'

export const featureFlagsState = (flags: FeatureFlags[]): boolean[] => {
  const result = queryClient.getQueryData<GetFeatureFlagsResult>([CoreQueryKeys.GetFeatureFlags])

  if (!result) throw Error('featureFlagsState | Feature flags are not available from query')

  const storedFlags = result.data.flags

  return flags.map(flag => storedFlags.find(storedFlag => storedFlag.name === flag)?.is_active ?? false)
}
