import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { TransactionsTemplate } from './template'
import { Transaction } from './types'
import { getTransactionHistory } from '../../queries/use-get-transaction-history'
import { WalletPagesPath } from '../../routes/types'
import { mapBackendTransactionsToUI } from '../../services/wallet/transaction-mapper'

export const Transactions = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const transactionHistoryData = useSuspenseQuery(getTransactionHistory())

  const transactions: Transaction[] = mapBackendTransactionsToUI(transactionHistoryData.data.data.transactions || [])

  const handleGoBack = () => {
    if (canGoBack) router.history.back()
    navigate({ to: WalletPagesPath.HOME })
  }

  return (
    <TransactionsTemplate
      transactions={transactions}
      onGoBack={handleGoBack}
      selectedTransaction={selectedTransaction}
      setSelectedTransaction={setSelectedTransaction}
    />
  )
}

export default Transactions
