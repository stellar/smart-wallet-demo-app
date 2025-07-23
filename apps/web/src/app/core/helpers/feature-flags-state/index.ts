import { CoreQueryKeys } from 'src/app/core/queries/query-keys'
import { FeatureFlags, GetFeatureFlagsResult } from 'src/app/core/services/setttings/types'
import { queryClient } from 'src/interfaces/query-client'

export const featureFlagsState = (flags: FeatureFlags[]): boolean[] => {
  const result = queryClient.getQueryData<GetFeatureFlagsResult>([CoreQueryKeys.GetFeatureFlags])

  if (!result) throw Error('featureFlagsState | Feature flags are not available from query')

  return flags.map(flag => result.data.flags[flag])
}
