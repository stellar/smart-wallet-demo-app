import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { recoverWalletUseCase } from 'src/app/auth/domain/use-cases/recover-wallet'
import { RecoverWalletInput } from 'src/app/auth/domain/use-cases/recover-wallet/types'

import { AuthQueryKeys } from './query-keys'

type UseCaseInput = RecoverWalletInput
type UseCaseResult = Awaited<ReturnType<typeof recoverWalletUseCase.handle>>

export const useRecoverWallet = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [AuthQueryKeys.RecoverWallet],
    mutationFn: async input => recoverWalletUseCase.handle(input),
    ...options,
  })
}
