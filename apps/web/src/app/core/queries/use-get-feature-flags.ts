import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { generalSettingsService } from 'src/app/core/services/general-setttings'
import { GetFeatureFlagsResult } from 'src/app/core/services/general-setttings/types'

import { CoreQueryKeys } from './query-keys'

type UseCaseResult = GetFeatureFlagsResult

export const getFeatureFlags = () =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [CoreQueryKeys.GetFeatureFlags],
    queryFn: () => generalSettingsService.getFeatureFlags(),
    staleTime: Infinity,
    gcTime: Infinity,
  })

export const useGetFeatureFlags = (
  options?: Omit<UseQueryOptions<UseCaseResult, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<UseCaseResult, Error> => {
  return useQuery({
    ...getFeatureFlags(),
    ...options,
  })
}
