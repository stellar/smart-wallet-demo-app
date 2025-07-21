import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { getInvitationInfoUseCase } from 'src/app/auth/domain/use-cases/get-invitation-info'
import {
  GetInvitationInfoInput,
  GetInvitationInfoResult,
} from 'src/app/auth/domain/use-cases/get-invitation-info/types'

import { AuthQueryKeys } from './query-keys'

type UseCaseInput = GetInvitationInfoInput
type UseCaseResult = GetInvitationInfoResult

export const getInvitationInfoOptions = (input: UseCaseInput) =>
  queryOptions<UseCaseResult, Error>({
    queryKey: [AuthQueryKeys.GetInvitationInfo, input.uniqueToken],
    queryFn: () => getInvitationInfoUseCase.handle(input),
  })

export const useGetInvitationInfo = (
  input: UseCaseInput,
  options?: Omit<UseQueryOptions<UseCaseResult, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<UseCaseResult, Error> => {
  return useQuery({
    ...getInvitationInfoOptions(input),
    ...options,
  })
}
