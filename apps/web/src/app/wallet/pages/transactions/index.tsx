import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { TransactionsTemplate } from './template'
import { useGetTransactionHistory } from '../../queries/use-get-transaction-history'
import { WalletPagesPath } from '../../routes/types'

export const Transactions = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  const { data: transactionHistoryData, isPending: isLoadingTransactionHistory } = useGetTransactionHistory()

  const transactions = transactionHistoryData?.data.transactions || []

  const handleGoBack = () => {
    if (canGoBack) router.history.back()
    navigate({ to: WalletPagesPath.HOME })
  }

  return (
    <TransactionsTemplate
      isLoadingTransactionHistory={isLoadingTransactionHistory}
      transactions={transactions}
      onGoBack={handleGoBack}
    />
  )
}

export default Transactions
