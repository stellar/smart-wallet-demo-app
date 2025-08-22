import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { claimGiftUseCase } from '../domain/use-cases/claim-gift'
import { ClaimGiftInput } from '../domain/use-cases/claim-gift/types'

type UseCaseInput = ClaimGiftInput
type UseCaseResult = Awaited<ReturnType<typeof claimGiftUseCase.handle>>

export const useClaimGift = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [WalletQueryKeys.ClaimGift],
    mutationFn: async input => claimGiftUseCase.handle(input),
    ...options,
  })
}
