import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { walletService } from '../services'
import { GetTransferOptionsInput } from '../services/wallet/types'

type UseCaseInput = GetTransferOptionsInput
type UseCaseResult = Awaited<ReturnType<typeof walletService.getTransferOptions>>

export const useGetTransferOptions = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [WalletQueryKeys.GetTransferOptions],
    mutationFn: async input => walletService.getTransferOptions(input),
    ...options,
  })
}
