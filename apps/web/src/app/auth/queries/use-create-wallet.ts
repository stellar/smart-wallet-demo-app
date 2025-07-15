import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { createWalletUseCase } from 'src/app/auth/domain/use-cases/create-wallet'
import { CreateWalletInput } from 'src/app/auth/domain/use-cases/create-wallet/types'
import { AuthQueryKeys } from './query-keys'

type UseCaseInput = CreateWalletInput
type UseCaseResult = Awaited<ReturnType<typeof createWalletUseCase.handle>>

export const useCreateWallet = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [AuthQueryKeys.CreateWallet],
    mutationFn: async input => createWalletUseCase.handle(input),
    ...options,
  })
}
