import { CoreQueryKeys } from 'src/app/core/queries/query-keys'
import { FeatureFlags, GetFeatureFlagsResult } from 'src/app/core/services/general-settings/types'
import { queryClient } from 'src/interfaces/query-client'

import { useGetFeatureFlags } from '../../queries/use-get-feature-flags'

const mapFlags = (flags: FeatureFlags[], storedFlags: GetFeatureFlagsResult[`data`][`flags`]): boolean[] =>
  flags.map(flag => storedFlags.find(storedFlag => storedFlag.name === flag)?.is_active ?? false)

export const featureFlagsState = (flags: FeatureFlags[]): boolean[] => {
  const result = queryClient.getQueryData<GetFeatureFlagsResult>([CoreQueryKeys.GetFeatureFlags])

  if (!result) return flags.map(() => false)

  const storedFlags = result.data.flags

  return mapFlags(flags, storedFlags)
}

export const useFeatureFlagsState = (flags: FeatureFlags[]) => {
  const { data: result } = useGetFeatureFlags()

  if (!result) return flags.map(() => false)

  const storedFlags = result.data.flags

  return mapFlags(flags, storedFlags)
}
