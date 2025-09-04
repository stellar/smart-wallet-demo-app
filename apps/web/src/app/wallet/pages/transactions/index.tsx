import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { modalService } from 'src/components/organisms/modal/provider'
import { ModalTransactionDetailsProps } from 'src/components/organisms/modal/variants'
import { a } from 'src/interfaces/cms/useAssets'

import { TransactionsTemplate } from './template'
import { Transaction } from '../../domain/models/transaction'
import { useGetTransactionHistory } from '../../queries/use-get-transaction-history'
import { WalletPagesPath } from '../../routes/types'
import { mapTxVendorName } from '../../utils'

export const Transactions = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  const { data: transactionHistoryData, isLoading: isLoadingTransactionHistory } = useGetTransactionHistory()

  const transactions = transactionHistoryData?.data.transactions || []

  const handleGoBack = () => {
    if (canGoBack) router.history.back()
    navigate({ to: WalletPagesPath.HOME })
  }

  const handleTransactionClick = (tx: Transaction) => {
    const mapBadgeVariant = (tx: Transaction): ModalTransactionDetailsProps['badge'] => {
      let badge: ModalTransactionDetailsProps['badge']

      if (tx.sendOrReceive === 'send') {
        badge = { variant: 'sent' }
      } else if (tx.sendOrReceive === 'receive') {
        badge = { variant: 'received' }
      }

      return badge
    }

    modalService.open({
      key: `transaction-${tx.hash}`,
      variantOptions: {
        variant: 'transaction-details',
        badge: mapBadgeVariant(tx),
        date: tx.date,
        vendor: {
          name: mapTxVendorName(tx),
        },
        actionType: tx.sendOrReceive !== undefined ? (tx.sendOrReceive === 'send' ? 'send' : 'receive') : undefined,
        amount: {
          value: tx.amount,
          asset: tx.asset,
        },
        transactionHash: tx.hash,
      },
      backgroundImageUri: tx.type === 'airdrop_claim' ? a('transactionsHistoryMintBackground') : undefined,
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
