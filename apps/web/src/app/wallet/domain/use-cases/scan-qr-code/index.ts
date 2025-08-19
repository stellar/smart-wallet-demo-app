import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import logger from 'src/app/core/services/logger'
import { transferTypeSchema, nftTypeSchema } from 'src/app/wallet/pages/home/schema'
import {
  GetTransferOptionsInput,
  transferOptionsInputKeys,
  transferTypes,
  TransferTypes,
} from 'src/app/wallet/services/wallet/types'
import BaseError from 'src/helpers/error-handling/base-error'
import { c } from 'src/interfaces/cms/useContent'

import { ScanQrCodeInput, ScanQrCodeResult } from './types'

export class ScanQrCodeUseCase extends UseCaseBase<ScanQrCodeResult> {
  async handle(input: ScanQrCodeInput): Promise<ScanQrCodeResult> {
    const { decodedText } = input

    const invalidQrCodeError = new BaseError(c('invalidQrCode'))

    if (!this.isValidTransferUrl(decodedText)) {
      throw invalidQrCodeError
    }

    try {
      const parsed = new URL(decodedText)
      const searchParams = new URLSearchParams(parsed.search)

      const transferOptionsInput = Object.fromEntries(
        transferOptionsInputKeys.map(key => [key, searchParams.get(key)])
      ) as Partial<GetTransferOptionsInput>

      switch (transferOptionsInput.type) {
        case 'transfer':
          transferTypeSchema.validateSync(transferOptionsInput)
          break
        case 'nft':
          nftTypeSchema.validateSync(transferOptionsInput)
          break
      }

      return transferOptionsInput
    } catch (error) {
      logger.error(`${this.constructor.name}.handle | Failed`, error)
      throw invalidQrCodeError
    }
  }

  private isValidTransferUrl(url: string): boolean {
    try {
      const parsed = new URL(url)

      if (parsed.origin !== window.location.origin) return false

      if (parsed.pathname !== '/wallet') return false

      const type = parsed.searchParams.get('type')
      return !!type && transferTypes.includes(type as TransferTypes)
    } catch {
      return false
    }
  }
}

const scanQrCodeUseCase = new ScanQrCodeUseCase()

export { scanQrCodeUseCase }
