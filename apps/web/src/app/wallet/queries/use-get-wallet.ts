import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { getWalletUseCase } from '../domain/use-cases/get-wallet'
import { GetWalletResult } from '../domain/use-cases/get-wallet/types'

type UseCaseResult = GetWalletResult

export const getWallet = () =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [WalletQueryKeys.GetWallet],
    queryFn: () => getWalletUseCase.handle(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })

export const useGetWallet = (
  options?: Omit<UseQueryOptions<UseCaseResult, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<UseCaseResult, Error> => {
  return useQuery({
    ...getWallet(),
    ...options,
  })
}
