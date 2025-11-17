import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { organizationService } from 'src/app/wallet/services'
import { GetOrganizationsResult } from 'src/app/wallet/services/organization/types'

import { WalletQueryKeys } from './query-keys'

type UseCaseResult = GetOrganizationsResult

export const getOrganizations = () =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [WalletQueryKeys.GetOrganizations],
    queryFn: () => organizationService.getOrganizations(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })

export const useGetOrganizations = (
  options?: Omit<UseQueryOptions<UseCaseResult, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<UseCaseResult, Error> => {
  return useQuery({
    ...getOrganizations(),
    ...options,
  })
}
