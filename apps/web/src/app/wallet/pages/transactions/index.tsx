import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { ModalProps } from 'src/components/organisms'
import { modalService } from 'src/components/organisms/modal/provider'
import { ModalTransactionDetailsProps } from 'src/components/organisms/modal/variants'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { TransactionsTemplate } from './template'
import { CustomTxTypes, Transaction } from '../../domain/models/transaction'
import { useGetTransactionHistory } from '../../queries/use-get-transaction-history'
import { useGetWallet } from '../../queries/use-get-wallet'
import { WalletPagesPath } from '../../routes/types'
import { mapTxVendorName } from '../../utils'
import { mapTxAsset } from '../../utils/map-tx-asset'

export const Transactions = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  // Wallet information
  const { data: walletData, isLoading: isLoadingProfile } = useGetWallet()

  // Transaction history
  const { data: transactionHistoryData, isLoading: isLoadingTransactionHistory } = useGetTransactionHistory()
  const transactions = transactionHistoryData?.data.transactions || []

  const handleGoBack = () => {
    if (canGoBack) router.history.back()
    navigate({ to: WalletPagesPath.HOME })
  }

  const handleTransactionClick = (tx: Transaction) => {
    const mapBadgeVariant = (tx: Transaction): ModalTransactionDetailsProps['badge'] => {
      let badge: ModalTransactionDetailsProps['badge']

      // Custom tx types badges
      switch (tx.type) {
        case CustomTxTypes.AIRDROP_CLAIM:
          badge = { variant: 'airdrop' }
          break
        case CustomTxTypes.DONATION:
          badge = { variant: 'organization' }
          break
      }

      // if badge is already set, return
      if (badge) return badge

      if (tx.sendOrReceive === 'send') {
        badge = { variant: 'sent' }
      } else if (tx.sendOrReceive === 'receive') {
        badge = { variant: 'received' }
      }

      return badge
    }

    const mapDescriptionItems = (tx: Transaction): ModalTransactionDetailsProps['descriptionItems'] => {
      switch (tx.type) {
        case CustomTxTypes.SWAG:
          if (tx.sendOrReceive === 'send')
            return tx.amount > 1 ? [c('transactionModalSendMultipleSwagLabel')] : [c('transactionModalSendSwagLabel')]
          if (tx.sendOrReceive === 'receive') return [c('transactionModalReceivedSwagLabel')]
          break
        case CustomTxTypes.BUY_PRODUCT:
          return tx.product?.map(product => product.description)
      }
    }

    const mapBackgroundImageUri = (tx: Transaction): ModalProps['backgroundImageUri'] => {
      if (tx.type === CustomTxTypes.AIRDROP_CLAIM) {
        return a('transactionsHistoryMintBackground')
      }
    }

    modalService.open({
      key: `transaction-${tx.hash}`,
      variantOptions: {
        variant: 'transaction-details',
        badge: mapBadgeVariant(tx),
        date: tx.date,
        vendor: {
          name: mapTxVendorName(tx),
          isVendorNameHidden: tx.type === CustomTxTypes.NFT_CLAIM,
          imageUri: tx.type === CustomTxTypes.NFT_CLAIM ? tx.token?.image_url : undefined,
          imageRadius: tx.type === CustomTxTypes.NFT_CLAIM ? 'sm' : undefined,
        },
        descriptionItems: mapDescriptionItems(tx),
        actionType: tx.sendOrReceive !== undefined ? (tx.sendOrReceive === 'send' ? 'send' : 'receive') : undefined,
        amount: {
          value: tx.amount,
          asset: mapTxAsset(tx),
        },
        transactionHash: tx.hash,
      },
      backgroundImageUri: mapBackgroundImageUri(tx),
    })
  }

  return (
    <TransactionsTemplate
      isLoadingTransactionHistory={isLoadingTransactionHistory}
      isLoadingBalance={isLoadingProfile}
      balance={walletData?.balance || 0}
      transactions={transactions}
      onGoBack={handleGoBack}
      onTransactionClick={handleTransactionClick}
    />
  )
}

export default Transactions
