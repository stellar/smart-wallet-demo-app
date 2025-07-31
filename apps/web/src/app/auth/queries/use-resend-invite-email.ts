import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { authService } from 'src/app/auth/services'
import { ResendInviteLinkInput } from 'src/app/auth/services/auth/types'

import { AuthQueryKeys } from './query-keys'

type UseCaseInput = ResendInviteLinkInput
type UseCaseResult = Awaited<ReturnType<typeof authService.resendInviteLink>>

export const useResendInviteEmail = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [AuthQueryKeys.SendRecoveryEmail],
    mutationFn: async input => authService.resendInviteLink(input),
    ...options,
  })
}
