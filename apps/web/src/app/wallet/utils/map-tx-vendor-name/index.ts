import { c } from 'src/interfaces/cms/useContent'

import { CustomTxTypes, Transaction } from '../../domain/models/transaction'

export const mapTxVendorName = (tx: Transaction): string => {
  switch (tx.type) {
    case CustomTxTypes.AIRDROP_CLAIM:
      return c('transactionAirdropClaimVendor')
    case CustomTxTypes.SWAG:
      if (tx.sendOrReceive === 'send') return c('transactionSendSwagVendor')
      if (tx.sendOrReceive === 'receive') return c('transactionReceivedSwagVendor')
      break
    case CustomTxTypes.NFT:
      if (!tx.vendor) return tx.token?.contract_address ?? ''
      break
    case CustomTxTypes.NFT_CLAIM:
      if (tx.token?.session_id) return tx.token?.session_id
      if (!tx.vendor) return tx.token?.contract_address ?? ''
      break
  }

  if (tx.vendor !== tx.toAddress && tx.vendor !== tx.fromAddress) return tx.vendor ?? ''

  if (tx.sendOrReceive === 'send' && tx.toAddress) return tx.toAddress

  if (tx.sendOrReceive === 'receive' && tx.fromAddress) return tx.fromAddress

  return tx.vendor ?? ''
}
