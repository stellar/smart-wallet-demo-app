import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { TransactionsTemplate } from './template'
import { Transaction } from './types'
import { WalletPagesPath } from '../../routes/types'

// Mock data for transactions
const mockTransactions = [
  {
    id: '1',
    type: 'payment',
    vendor: 'Vendor Name',
    amount: -323.8372,
    asset: 'XLM',
    date: '2025-09-18T14:32:00Z',
    txId: 'GBN6N2NLX3V...YXGPRMZ77L5O7',
  },
  {
    id: '2',
    type: 'payment',
    vendor: 'Vendor Name',
    amount: -112.9372,
    asset: 'XLM',
    date: '2025-09-18T13:10:00Z',
    txId: 'GBN6N2NLX3V...YXGPRMZ77L5O7',
  },
  {
    id: '3',
    type: 'airdrop',
    vendor: 'XLM Airdrop',
    amount: 1000,
    asset: 'XLM',
    date: '2025-09-17T10:30:00Z',
    txId: 'GBN6N2NLX3V...YXGPRMZ77L5O7',
  },
]

export const Transactions = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const handleGoBack = () => {
    if (canGoBack) router.history.back()
    navigate({ to: WalletPagesPath.HOME })
  }

  return (
    <TransactionsTemplate
      transactions={mockTransactions}
      onGoBack={handleGoBack}
      selectedTransaction={selectedTransaction}
      setSelectedTransaction={setSelectedTransaction}
    />
  )
}

export default Transactions
