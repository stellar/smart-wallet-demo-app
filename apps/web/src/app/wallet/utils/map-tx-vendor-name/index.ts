import { c } from 'src/interfaces/cms/useContent'

import { Transaction } from '../../domain/models/transaction'

export const mapTxVendorName = (tx: Transaction): string => {
  if (tx.type === 'airdrop_claim') return c('transactionAirdropClaimVendor')

  if (tx.vendor !== tx.toAddress && tx.vendor !== tx.fromAddress) return tx.vendor

  if (tx.sendOrReceive === 'send' && tx.toAddress) return tx.toAddress

  if (tx.sendOrReceive === 'receive' && tx.fromAddress) return tx.fromAddress

  return tx.vendor
}
