import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { walletService } from '../services'
import { GetNftClaimOptionsResult } from '../services/wallet/types'

type UseGetNftClaimOptionsInput = {
  supply_id: string | undefined
  session_id: string | undefined
  resource: string | undefined
}

export const useGetNftClaimOptions = (
  options?: UseMutationOptions<GetNftClaimOptionsResult, Error, UseGetNftClaimOptionsInput>
) => {
  return useMutation({
    mutationFn: ({ supply_id, session_id, resource }: UseGetNftClaimOptionsInput) =>
      walletService.getNftClaimOptions(supply_id, session_id, resource),
    ...options,
  })
}
