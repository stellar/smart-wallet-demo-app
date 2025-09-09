import { CustomTxTypes, Transaction } from '../../domain/models/transaction'

export const mapTxAsset = (tx: Transaction): string => {
  switch (tx.type) {
    case CustomTxTypes.NFT:
      return tx.amount === 1 ? 'NFT' : 'NFTs'
    case CustomTxTypes.SWAG:
      if (tx.amount > 1) return 'SWAGs'
      break
  }

  return tx.asset
}
