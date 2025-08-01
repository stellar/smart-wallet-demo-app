import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { TransactionsTemplate } from './template'
import { useGetTransactionHistory } from '../../queries/use-get-transaction-history'
import { WalletPagesPath } from '../../routes/types'
import { Transaction } from '../../services/wallet/types'

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

  const handleTransactionClick = (tx: Transaction) => {
    modalService.open({
      key: `transaction-${tx.hash}`,
      variantOptions: {
        variant: 'transaction-details',
        date: tx.date,
        source: {
          name: tx.vendor,
        },
        amount: {
          value: tx.amount,
          asset: tx.asset,
        },
        transactionHash: tx.hash,
        button: {
          children: c('close'),
          variant: 'secondary',
          size: 'lg',
          isRounded: true,
          isFullWidth: true,
          onClick: () => {
            modalService.close()
          },
        },
      },
      backgroundImageUri: tx.type === 'MINT' ? a('transactionsHistoryMintBackground') : a('customModalBackground'),
    })
  }

  return (
    <TransactionsTemplate
      isLoadingTransactionHistory={isLoadingTransactionHistory}
      transactions={transactions}
      onGoBack={handleGoBack}
      onTransactionClick={handleTransactionClick}
    />
  )
}

export default Transactions
