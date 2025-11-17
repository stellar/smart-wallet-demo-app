import { queryOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { walletService } from '../services'
import { GetNftsResult } from '../services/wallet/types'

type UseCaseResult = GetNftsResult

export const getNfts = () =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [WalletQueryKeys.GetNfts],
    queryFn: async () => walletService.getNfts(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })

export const useGetNfts = (options?: UseQueryOptions<GetNftsResult, Error>) => {
  return useQuery<GetNftsResult, Error>({
    ...getNfts(),
    ...options,
  })
}
