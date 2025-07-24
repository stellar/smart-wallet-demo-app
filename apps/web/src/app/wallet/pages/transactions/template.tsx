import { Text, Icon } from '@stellar/design-system'

import { Modal } from 'src/components/molecules/modal'
import { NavigateButton } from 'src/components/molecules/navigate-button'
import { SafeAreaView } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'
import { Transaction } from './types'

interface TransactionsTemplateProps {
  transactions: Transaction[]
  onGoBack: () => void
  selectedTransaction: Transaction | null
  setSelectedTransaction: (tx: Transaction | null) => void
}

// Helper to group transactions by date (YYYY-MM-DD)
function groupByDate(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(tx)
      return acc
    },
    {} as Record<string, Transaction[]>
  )
}

export const TransactionsTemplate = ({
  transactions,
  onGoBack,
  selectedTransaction,
  setSelectedTransaction,
}: TransactionsTemplateProps) => {
  const isEmpty = transactions.length === 0
  const grouped = groupByDate(transactions)
  const dateOrder = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-8 mb-7">
        <NavigateButton variant="secondary" onClick={onGoBack} />
        <Text as="h1" size="xl" className="text-xl leading-8 font-semibold">
          {c('transactionHistoryTitle')}
        </Text>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-96">
            <img src="/src/assets/images/transactions-history-empty-list.png" alt="No transactions" className="mb-6" />
            <Text as="div" size="lg" className="font-semibold mb-2">
              {c('noTransactionHistoryTitle')}
            </Text>
            <Text as="div" size="md" className="text-textSecondary">
              {c('noTransactionHistoryDescription')}
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {dateOrder.map(date => (
              <div key={date}>
                <Text as="div" size="sm" className="text-textSecondary mb-2">
                  {date}
                </Text>
                <div className="flex flex-col gap-3">
                  {grouped[date].map(tx => (
                    <button
                      key={tx.id}
                      className={`flex items-center justify-between p-4 rounded-xl bg-white shadow-sm transition hover:bg-gray-50 ${tx.type === 'airdrop' ? 'relative overflow-hidden border-0' : ''}`}
                      style={
                        tx.type === 'airdrop'
                          ? {
                              background:
                                'url(/src/assets/images/transactions-history-list-background.png) center/cover no-repeat, #ffe066',
                            }
                          : {}
                      }
                      onClick={() => setSelectedTransaction(tx)}
                    >
                      <div className="flex flex-col text-left">
                        <Text
                          as="span"
                          size="md"
                          className="font-medium text-[#171717]"
                          style={{ fontSize: 16, lineHeight: '24px' }}
                        >
                          {tx.vendor}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium text-[#171717] text-right"
                          style={{ fontSize: 16, lineHeight: '24px' }}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount}
                          {tx.asset ? ` ${tx.asset}` : ''}
                        </span>
                        <Icon.ChevronRight width={16} height={16} className="text-[#8F8F8F]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <Modal
            title={{
              text: selectedTransaction.vendor,
              image: selectedTransaction.type === 'airdrop' ? { source: 'blank-space', variant: 'md' } : undefined,
            }}
            description={`Transaction ID\n${selectedTransaction.txId}`}
            backgroundImageUri={
              selectedTransaction.type === 'airdrop' ? '/src/assets/images/airdrop-default-background.png' : undefined
            }
            button={{
              children: c('close'),
              variant: 'primary',
              size: 'lg',
              isRounded: true,
              onClick: () => setSelectedTransaction(null),
            }}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </SafeAreaView>
  )
}

export default TransactionsTemplate
