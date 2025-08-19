import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { walletService } from '../services'
import { GetNftsResult } from '../services/wallet/types'

export const useGetNfts = (options?: UseQueryOptions<GetNftsResult, Error>) => {
  return useQuery<GetNftsResult, Error>({
    queryKey: [WalletQueryKeys.GetNfts],
    queryFn: async () => walletService.getNfts(),
    ...options,
  })
}
