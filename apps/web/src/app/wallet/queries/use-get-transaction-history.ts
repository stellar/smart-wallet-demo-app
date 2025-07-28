import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { walletService } from 'src/app/wallet/services'
import { GetTransactionHistoryResult } from 'src/app/wallet/services/wallet/types'

import { WalletQueryKeys } from './query-keys'

type UseCaseResult = GetTransactionHistoryResult

export const getTransactionHistory = () =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [WalletQueryKeys.GetTransactionHistory],
    queryFn: () => walletService.getTransactionHistory(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })

export const useGetTransactionHistory = (
  options?: Omit<UseQueryOptions<UseCaseResult, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<UseCaseResult, Error> => {
  return useQuery({
    ...getTransactionHistory(),
    ...options,
  })
} 