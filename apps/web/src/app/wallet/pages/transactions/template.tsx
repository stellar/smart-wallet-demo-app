import { Text, Icon } from '@stellar/design-system'
import clsx from 'clsx'
import Skeleton from 'react-loading-skeleton'

import { formatNumber, createShortStellarAddress, isValidStellarAddress } from 'src/app/core/utils'
import { AssetAmount, NavigateButton } from 'src/components/molecules'
import { SafeAreaView } from 'src/components/organisms'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { EmptyList } from '../../components'
import { CustomTxTypes, Transaction } from '../../domain/models/transaction'
import { mapTxVendorName } from '../../utils'
import { mapTxAsset } from '../../utils/map-tx-asset'

interface TransactionsTemplateProps {
  isLoadingTransactionHistory: boolean
  isLoadingBalance: boolean
  balance: number
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
  isLoadingBalance,
  balance,
  transactions,
  onGoBack,
  onTransactionClick,
}: TransactionsTemplateProps) => {
  const isEmpty = !isLoadingTransactionHistory && transactions.length === 0
  const grouped = groupByDate(transactions)
  const dateOrder = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const formatVendorName = (tx: Transaction) => {
    const vendor = mapTxVendorName(tx)
    if (isValidStellarAddress(vendor)) return createShortStellarAddress(vendor, { onlyValidAddress: true })

    const sliceAmount = 8
    if (vendor.length <= sliceAmount * 2) return vendor
    return `${vendor.slice(0, sliceAmount)}...${vendor.slice(-sliceAmount)}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric', // removes leading zero (e.g., 2 instead of 02)
      minute: '2-digit',
      hour12: true,
    })
  }

  const TransactionListItem = ({ tx }: { tx: Transaction }) => {
    let amountSignal = ''

    if (tx.sendOrReceive === 'send') {
      amountSignal = '-'
    } else if (tx.sendOrReceive === 'receive') amountSignal = '+'

    return (
      <button
        key={tx.hash}
        className={clsx(
          `flex items-center justify-between p-4 rounded-xl shadow-sm transition active:shadow-lg active:border-borderSecondary`,
          {
            'bg-white': tx.type !== CustomTxTypes.DONATION,
            'bg-pinkSecondary': tx.type === CustomTxTypes.DONATION,
          }
        )}
        style={
          tx.type === 'airdrop_claim'
            ? {
                background: `url(${a('transactionsHistoryListMintBackground')}) center/cover no-repeat, #ffe066`,
              }
            : undefined
        }
        onClick={() => onTransactionClick(tx)}
      >
        <div className="flex w-full justify-between items-center break-all">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-col text-left truncate">
              <Text as="span" size="md" weight="medium">
                {formatVendorName(tx)}
              </Text>
              <div className="flex items-center text-textSecondary">
                <Text as="span" size="xs">
                  {formatTime(tx.date)}
                </Text>
              </div>
            </div>
            <div className="flex text-right truncate items-center">
              <Text as="span" size="md" weight="medium">
                {amountSignal} {formatNumber(tx.amount, 'en-US', 14, 0, 4)}{' '}
                {createShortStellarAddress(mapTxAsset(tx), {
                  onlyValidAddress: true,
                })}
              </Text>
            </div>
          </div>

          <div className="ml-1">
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
            {dateOrder.map((date, index) => (
              <div key={date}>
                <div className="flex justify-between items-center text-textSecondary mb-2 px-2">
                  <Text as="span" size="sm">
                    {date}
                  </Text>

                  {index == 0 &&
                    (isLoadingBalance ? (
                      <Skeleton height={22} width={130} />
                    ) : (
                      <div className="flex flex-row gap-1 text-textSecondary items-center break-words">
                        <Text as="span" size="sm" weight="regular" addlClassName="text-center">
                          {c('balance')}
                        </Text>
                        <AssetAmount
                          amount={balance}
                          amountColor="textSecondary"
                          size="sm"
                          weight="regular"
                          asset={{ value: 'XLM', variant: 'lg' }}
                        />
                      </div>
                    ))}
                </div>

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
