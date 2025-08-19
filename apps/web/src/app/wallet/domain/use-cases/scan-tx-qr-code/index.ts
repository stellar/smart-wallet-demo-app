import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import logger from 'src/app/core/services/logger'
import { swagTypeSchema, transferTypeSchema } from 'src/app/wallet/pages/home/schema'
import {
  GetTransferOptionsInput,
  transferOptionsInputKeys,
  transferTypes,
  TransferTypes,
} from 'src/app/wallet/services/wallet/types'
import BaseError from 'src/helpers/error-handling/base-error'
import { c } from 'src/interfaces/cms/useContent'

import { ScanTxQrCodeInput, ScanTxQrCodeResult } from './types'

export class ScanTxQrCodeUseCase extends UseCaseBase<ScanTxQrCodeResult> {
  async handle(input: ScanTxQrCodeInput): Promise<ScanTxQrCodeResult> {
    const { decodedText } = input

    const invalidQrCodeError = new BaseError(c('invalidQrCode'))

    if (!this.isValidTransferUrl(decodedText)) {
      throw invalidQrCodeError
    }

    try {
      const parsed = new URL(decodedText)
      const searchParams = new URLSearchParams(parsed.search)

      // Get transfer options input from search params
      const transferOptionsInput = Object.fromEntries(
        transferOptionsInputKeys.map(key => [key, searchParams.get(key)])
      ) as Partial<GetTransferOptionsInput>

      // Validate transfer options input
      switch (transferOptionsInput.type) {
        case 'transfer':
          transferTypeSchema.validateSync(transferOptionsInput)
          break
        case 'swag':
          swagTypeSchema.validateSync(transferOptionsInput)
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

      // Check if domain matches
      if (parsed.origin !== window.location.origin) return false

      // Check if path matches
      if (parsed.pathname !== '/wallet') return false

      // Check if type param exists and is allowed
      const type = parsed.searchParams.get('type')
      return !!type && transferTypes.includes(type as TransferTypes)
    } catch {
      return false
    }
  }
}

const scanTxQrCodeUseCase = new ScanTxQrCodeUseCase()

export { scanTxQrCodeUseCase }
