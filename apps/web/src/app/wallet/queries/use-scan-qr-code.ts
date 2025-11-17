import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { scanQrCodeUseCase } from '../domain/use-cases/scan-qr-code'
import { ScanQrCodeInput } from '../domain/use-cases/scan-qr-code/types'

type UseCaseInput = ScanQrCodeInput
type UseCaseResult = Awaited<ReturnType<typeof scanQrCodeUseCase.handle>>

export const useScanQrCode = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [WalletQueryKeys.ScanQrCode],
    mutationFn: async input => scanQrCodeUseCase.handle(input),
    ...options,
  })
}
