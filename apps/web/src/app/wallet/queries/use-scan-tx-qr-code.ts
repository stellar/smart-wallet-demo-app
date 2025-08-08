import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { WalletQueryKeys } from './query-keys'
import { scanTxQrCodeUseCase } from '../domain/use-cases/scan-tx-qr-code'
import { ScanTxQrCodeInput } from '../domain/use-cases/scan-tx-qr-code/types'

type UseCaseInput = ScanTxQrCodeInput
type UseCaseResult = Awaited<ReturnType<typeof scanTxQrCodeUseCase.handle>>

export const useScanTxQrCode = (options?: UseMutationOptions<UseCaseResult, Error, UseCaseInput>) => {
  return useMutation<UseCaseResult, Error, UseCaseInput>({
    mutationKey: [WalletQueryKeys.ScanTxQrCode],
    mutationFn: async input => scanTxQrCodeUseCase.handle(input),
    ...options,
  })
}
