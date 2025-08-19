import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { walletService } from '../services'
import { GetNftClaimOptionsResult } from '../services/wallet/types'

type UseGetNftClaimOptionsInput = {
  session_id: string
  resource: string
}

export const useGetNftClaimOptions = (
  options?: UseMutationOptions<GetNftClaimOptionsResult, Error, UseGetNftClaimOptionsInput>
) => {
  return useMutation({
    mutationFn: ({ session_id, resource }: UseGetNftClaimOptionsInput) =>
      walletService.getNftClaimOptions(session_id, resource),
    ...options,
  })
}
