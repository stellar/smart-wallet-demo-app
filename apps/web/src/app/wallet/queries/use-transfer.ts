import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { transferUseCase } from '../domain/use-cases/transfer'
import { TransferInput } from '../domain/use-cases/transfer/types'

type UseCaseInput = TransferInput
type UseCaseResult = Awaited<ReturnType<typeof transferUseCase.handle>>

export const useTransfer = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [WalletQueryKeys.Transfer],
    mutationFn: async input => transferUseCase.handle(input),
    ...options,
  })
}
