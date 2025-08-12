import { Text, Icon } from '@stellar/design-system'
import Skeleton from 'react-loading-skeleton'

import { formatNumber, createShortStellarAddress } from 'src/app/core/utils'
import { NavigateButton } from 'src/components/molecules'
import { SafeAreaView } from 'src/components/organisms'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { EmptyList } from '../../components'
import { Transaction } from '../../domain/models/transaction'
import { mapTxVendorName } from '../../utils'

interface TransactionsTemplateProps {
  isLoadingTransactionHistory: boolean
  transactions: Transaction[]
  onGoBack: () => void
  onTransactionClick: (tx: Transaction) => void
}

// Helper to group transactions by date (YYYY-MM-DD)
function groupByDate(transactions: Transaction[]) {
  const grouped: Record<string, Transaction[]> = transactions.reduce(
    (acc, tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(tx)
      return acc
    },
    {} as Record<string, Transaction[]>
  )

  // Sort transactions by date under each group
  const sorted: Record<string, Transaction[]> = {}
  Object.keys(grouped).forEach(dateKey => {
    sorted[dateKey] = grouped[dateKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  return sorted
}

export const TransactionsTemplate = ({
  isLoadingTransactionHistory,
  transactions,
  onGoBack,
  onTransactionClick,
}: TransactionsTemplateProps) => {
  const isEmpty = !isLoadingTransactionHistory && transactions.length === 0
  const grouped = groupByDate(transactions)
  const dateOrder = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const TransactionListItem = ({ tx }: { tx: Transaction }) => {
    let amountSignal = ''

    if (tx.sendOrReceive === 'send') {
      amountSignal = '-'
    } else if (tx.sendOrReceive === 'receive') amountSignal = '+'

    return (
      <button
        key={tx.hash}
        className={`flex items-center justify-between p-4 rounded-xl bg-white shadow-sm transition hover:bg-gray-50`}
        style={
          tx.type === 'MINT'
            ? {
                background: `url(${a('transactionsHistoryListMintBackground')}) center/cover no-repeat, #ffe066`,
              }
            : undefined
        }
        onClick={() => onTransactionClick(tx)}
      >
        <div className="flex w-full justify-between items-center">
          <div className="flex-[0.5] text-left truncate">
            <Text as="span" size="md" className="font-medium text-text text-base leading-6">
              {createShortStellarAddress(mapTxVendorName(tx), { onlyValidAddress: true })}
            </Text>
          </div>
          <div className="flex-[0.325] text-right truncate">
            <span className="font-medium text-text text-base leading-6">
              {amountSignal}
              {formatNumber(tx.amount, 'en-US', 14, 2, 2)}
            </span>
          </div>
          <div className="flex-[0.125] text-right truncate">
            <span className="font-medium text-text text-base leading-6">{tx.asset}</span>
          </div>
          <div className="flex-[0.025]">
            <Icon.ChevronRight width={16} height={16} className="text-foreground" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-8 mb-7">
        <NavigateButton variant="secondary" onClick={onGoBack} />
        <Text as="h1" size="xl" className="text-xl leading-8 font-semibold">
          {c('transactionHistoryTitle')}
        </Text>

        {isLoadingTransactionHistory && <Skeleton height={56} count={8} className="mb-2" />}

        {isEmpty && (
          <EmptyList title={c('noTransactionHistoryTitle')} description={c('noTransactionHistoryDescription')} />
        )}

        {!isEmpty && (
          <div className="flex flex-col gap-6">
            {dateOrder.map(date => (
              <div key={date}>
                <Text as="div" size="sm" className="text-textSecondary mb-2">
                  {date}
                </Text>
                <div className="flex flex-col gap-3">
                  {grouped[date].map(tx => (
                    <TransactionListItem key={tx.hash} tx={tx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SafeAreaView>
  )
}

export default TransactionsTemplate
