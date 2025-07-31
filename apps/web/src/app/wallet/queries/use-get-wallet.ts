import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { walletService } from 'src/app/wallet/services'
import { GetWalletResult } from 'src/app/wallet/services/wallet/types'

import { WalletQueryKeys } from './query-keys'

type UseCaseResult = GetWalletResult

export const getWallet = () =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [WalletQueryKeys.GetWallet],
    queryFn: () => walletService.getWallet(),
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
