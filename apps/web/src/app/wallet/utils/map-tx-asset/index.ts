import { CustomTxTypes, Transaction } from '../../domain/models/transaction'

export const mapTxAsset = (tx: Transaction): string => {
  if (tx.type === CustomTxTypes.NFT) return tx.amount === 1 ? 'NFT' : 'NFTs'

  return tx.asset
}
