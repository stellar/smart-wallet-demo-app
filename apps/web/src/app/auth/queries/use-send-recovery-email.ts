import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { authService } from 'src/app/auth/services'
import { SendRecoveryLinkInput } from 'src/app/auth/services/auth/types'

import { AuthQueryKeys } from './query-keys'

type UseCaseInput = SendRecoveryLinkInput
type UseCaseResult = Awaited<ReturnType<typeof authService.sendRecoveryLink>>

export const useSendRecoveryEmail = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [AuthQueryKeys.SendRecoveryEmail],
    mutationFn: async input => authService.sendRecoveryLink(input),
    ...options,
  })
}
