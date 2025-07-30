import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { TransactionsTemplate } from './template'
import { getTransactionHistory } from '../../queries/use-get-transaction-history'
import { WalletPagesPath } from '../../routes/types'

export const Transactions = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  const transactionHistoryData = useSuspenseQuery(getTransactionHistory())

  const transactions = transactionHistoryData.data.data.transactions || []

  const handleGoBack = () => {
    if (canGoBack) router.history.back()
    navigate({ to: WalletPagesPath.HOME })
  }

  return <TransactionsTemplate transactions={transactions} onGoBack={handleGoBack} />
}

export default Transactions
