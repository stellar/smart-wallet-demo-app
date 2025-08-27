import { GetTransferOptionsInput } from 'src/app/wallet/services/wallet/types'

export type TransferInput = {
  optionsJSON?: string
} & GetTransferOptionsInput
