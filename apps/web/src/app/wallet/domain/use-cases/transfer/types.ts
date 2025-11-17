import { GetTransferOptionsInput } from 'src/app/wallet/services/wallet/types'

export type TransferInput = {
  shouldFundWallet?: boolean
  optionsJSON?: string
} & GetTransferOptionsInput
