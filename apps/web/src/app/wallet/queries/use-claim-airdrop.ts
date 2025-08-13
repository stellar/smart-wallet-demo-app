import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { claimAirdropUseCase } from '../domain/use-cases/claim-airdrop'

type UseCaseResult = Awaited<ReturnType<typeof claimAirdropUseCase.handle>>

export const useClaimAirdrop = (options?: UseMutationOptions<UseCaseResult, Error>) => {
  return useMutation<UseCaseResult, Error>({
    mutationKey: [WalletQueryKeys.ClaimAirdrop],
    mutationFn: async () => claimAirdropUseCase.handle(),
    ...options,
  })
}
