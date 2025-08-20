import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { claimNftUseCase } from '../domain/use-cases/claim-nft'
import { ClaimNftInput } from '../domain/use-cases/claim-nft/types'

type UseCaseInput = ClaimNftInput
type UseCaseResult = Awaited<ReturnType<typeof claimNftUseCase.handle>>

export const useClaimNft = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [WalletQueryKeys.ClaimNft],
    mutationFn: async input => claimNftUseCase.handle(input),
    ...options,
  })
}
