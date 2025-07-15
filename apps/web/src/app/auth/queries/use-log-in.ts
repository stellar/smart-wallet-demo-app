import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { logInUseCase } from 'src/app/auth/domain/use-cases/log-in'
import { LogInInput } from 'src/app/auth/domain/use-cases/log-in/types'
import { AuthQueryKeys } from './query-keys'

type UseCaseInput = LogInInput
type UseCaseResult = Awaited<ReturnType<typeof logInUseCase.handle>>

export const useLogIn = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [AuthQueryKeys.LogIn],
    mutationFn: async input => logInUseCase.handle(input),
    ...options,
  })
}
