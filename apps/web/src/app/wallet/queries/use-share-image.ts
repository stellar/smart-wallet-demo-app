import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { shareImageUseCase } from '../domain/use-cases/share-image'
import { ShareImageInput } from '../domain/use-cases/share-image/types'

type UseCaseInput = ShareImageInput
type UseCaseResult = Awaited<ReturnType<typeof shareImageUseCase.handle>>

export const useShareImage = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [WalletQueryKeys.ShareImage],
    mutationFn: async input => shareImageUseCase.handle(input),
    ...options,
  })
}
