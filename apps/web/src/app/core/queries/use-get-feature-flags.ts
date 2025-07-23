import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { settingsService } from 'src/app/core/services/setttings'
import { GetFeatureFlagsResult } from 'src/app/core/services/setttings/types'

import { CoreQueryKeys } from './query-keys'

type UseCaseResult = GetFeatureFlagsResult

export const getFeatureFlags = () =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [CoreQueryKeys.GetFeatureFlags],
    queryFn: () => settingsService.getFeatureFlags(),
    staleTime: Infinity,
    gcTime: Infinity,
  })

export const useGetInvitationInfo = (
  options?: Omit<UseQueryOptions<UseCaseResult, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<UseCaseResult, Error> => {
  return useQuery({
    ...getFeatureFlags(),
    ...options,
  })
}
