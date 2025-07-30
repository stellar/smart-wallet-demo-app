import { Button, Text, Icon, CopyText } from '@stellar/design-system'

import { modalService } from 'src/components/molecules/modal/provider'
import { NavigateButton } from 'src/components/molecules/navigate-button'
import { SafeAreaView } from 'src/components/organisms'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { Transaction } from '../../services/wallet/types'

interface TransactionsTemplateProps {
  transactions: Transaction[]
  onGoBack: () => void
}

// Helper functions for transaction modal
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const formatAmount = (amount: string, asset: string) => {
  const numAmount = parseFloat(amount)
  const formattedAmount = numAmount.toLocaleString()
  return `${formattedAmount} ${asset}`
}

const truncateHash = (hash: string) => {
  if (hash.length <= 20) return hash
  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`
}

const createTransactionModalContent = (transaction: Transaction) => (
  <div className="flex flex-col gap-4">
    {/* Close Button - Positioned outside modal */}
    <NavigateButton
      className="absolute -top-10 right-0 bg-black/30 rounded-full"
      type="close"
      variant="ghost"
      onClick={() => modalService.close()}
    />

    {/* Top Section with Date, Type, and Amount */}
    <div className="pt-4 pb-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="flex items-center justify-center px-1.5 py-0.5 rounded-full border bg-[var(--color-background-tertiary)] border-[var(--color-border-primary)]">
            <Text
              as="div"
              size="sm"
              className="text-center text-[var(--color-text-secondary) font-semibold text-xs leading-[18px]"
            >
              {formatDate(transaction.date)}
            </Text>
          </div>
        </div>
        <div className="flex flex-col items-center mb-3 gap-1">
          <Text
            as="div"
            size="lg"
            className="text-center text-[var(--color-text-secondary)] font-medium text-lg leading-[26px]"
          >
            {transaction.type === 'MINT' ? c('transactionModalMintTitle') : transaction.vendor}
          </Text>
        </div>
        <Text
          as="div"
          size="xl"
          className="text-center text-[var(--color-text)] font-semibold text-2xl leading-[32px] tracking-tight"
        >
          {formatAmount(transaction.amount, transaction.asset)}
        </Text>
      </div>
    </div>

    {/* Transaction ID Section */}
    <div className="pb-4">
      <div className="flex flex-col items-start">
        {/* Label */}
        <div className="flex flex-row items-center gap-1">
          <Text
            as="div"
            size="sm"
            className="text-[var(--color-text-secondary)] font-inter font-medium text-sm leading-[20px]"
          >
            {c('transactionModalTransactionIdLabel')}
          </Text>
        </div>

        {/* Input Field */}
        <div className="flex flex-row items-start rounded-lg p-0">
          <div className="flex flex-row items-center gap-2">
            <Text
              as="div"
              size="md"
              className="text-[var(--color-text)] font-inter font-normal text-base leading-[24px]"
            >
              {truncateHash(transaction.hash)}
            </Text>

            {/* Copy Button */}
            <CopyText textToCopy={transaction.hash} title={c('transactionModalCopyTransactionIdTitle')}>
              <button className="flex flex-row justify-center items-center rounded-full border w-[28px] h-[28px] px-2 py-1 gap-1 bg-[var(--color-background-tertiary)] border-[var(--color-border-primary)]">
                <Icon.Copy01 width={12} height={12} className="text-[var(--color-foreground-primary)]" />
              </button>
            </CopyText>
          </div>
        </div>
      </div>
    </div>

    {/* Close Button */}
    <div>
      <Button variant={'secondary'} size={'lg'} isRounded isFullWidth onClick={() => modalService.close()}>
        {c('close')}
      </Button>
    </div>
  </div>
)

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

export const TransactionsTemplate = ({ transactions, onGoBack }: TransactionsTemplateProps) => {
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
            <img
              src={a('transactionsHistoryEmptyList')}
              alt={c('noTransactionHistoryTitle')}
              className="mb-6 max-w-[60%]"
            />
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
                      key={tx.hash}
                      className={`flex items-center justify-between p-4 rounded-xl bg-white shadow-sm transition hover:bg-gray-50`}
                      style={
                        tx.type === 'MINT'
                          ? {
                              background: `url(${a('transactionsHistoryListMintBackground')}) center/cover no-repeat, #ffe066`,
                            }
                          : undefined
                      }
                      onClick={() => {
                        modalService.open({
                          key: `transaction-${tx.hash}`,
                          backgroundImageUri:
                            tx.type === 'MINT'
                              ? a('transactionsHistoryMintBackground')
                              : a('transactionsHistoryDefaultBackground'),
                          children: createTransactionModalContent(tx),
                        })
                      }}
                    >
                      <div className="flex flex-col text-left">
                        <Text as="span" size="md" className="font-medium text-[var(--color-text)] text-base leading-6">
                          {tx.vendor}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-text)] text-right text-base leading-6">
                          {parseFloat(tx.amount) > 0 ? '+' : ''}
                          {tx.amount}
                          {tx.asset ? ` ${tx.asset}` : ''}
                        </span>
                        <Icon.ChevronRight width={16} height={16} className="text-[var(--color-foreground-primary)]" />
                      </div>
                    </button>
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
