import { Transaction, UITransaction } from './types'

/**
 * Maps backend transaction data to UI transaction format
 * The backend provides hash, envelopeXdr, and operations
 * We need to map this to UI-friendly fields
 */
export const mapBackendTransactionToUI = (tx: Transaction, index: number): UITransaction => {
  return {
    id: tx.hash || `tx-${index}`,
    type: 'payment',
    vendor: 'Unknown Vendor',
    amount: 0,
    asset: 'XLM',
    date: new Date().toISOString(),
    txId: tx.hash || `tx-${index}`,
  }
}

/**
 * Maps an array of backend transactions to UI transactions
 */
export const mapBackendTransactionsToUI = (transactions: Transaction[]): UITransaction[] => {
  return transactions.map((tx, index) => mapBackendTransactionToUI(tx, index))
} 