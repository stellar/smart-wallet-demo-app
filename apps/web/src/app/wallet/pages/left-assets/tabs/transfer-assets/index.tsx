import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ConfirmTransferDrawer } from 'src/app/wallet/components'
import { walletAddressFormSchema, WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { TransferInput } from 'src/app/wallet/domain/use-cases/transfer/types'
import { getWallet as getWalletQueryOptions, useGetWallet } from 'src/app/wallet/queries/use-get-wallet'
import { useTransfer } from 'src/app/wallet/queries/use-transfer'
import { ErrorHandling } from 'src/helpers/error-handling'
import BaseError from 'src/helpers/error-handling/base-error'
import { queryClient } from 'src/interfaces/query-client'

import { ConfirmTransferDrawer } from './components'
import TransferAssetsTemplate, { Organization } from './template'

export const TransferAssets = () => {
  const getWallet = useGetWallet()
  const walletData = getWallet.data
  const [reviewStandardTransferInfo, setReviewStandardTransferInfo] = useState<WalletAddressFormValues | null>(null)

  const standardTransferForm = useForm<WalletAddressFormValues>({
    resolver: yupResolver(walletAddressFormSchema),
    mode: 'onSubmit',
  })

  const transfer = useTransfer({
    onSuccess: () => {
      // TODO: show success modal
      queryClient.forceRefetch(getWalletQueryOptions())
      standardTransferForm.reset()
      setReviewStandardTransferInfo(null)
    },
  })

  const mockOrganizations = [
    {
      title: 'Stellar Foundation',
      description: 'Stellar Foundation description',
      imageUri: 'https://en.cryptonomist.ch/wp-content/uploads/2022/10/robinhood-stellar-xlm.jpg',
      walletAddress: 'GDQGQYV6Q7D6VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7VY7',
    },
  ]

  const handleOrganizationClick = (_organization: Organization) => {
    // TODO: open transfer drawer function
    alert('Organization clicked')
  }

  const handleStandardTransferSubmit = async (values: WalletAddressFormValues) => {
    setReviewStandardTransferInfo(values)
  }

  const handleStandardTransferConfirm = () => {
    try {
      if (!reviewStandardTransferInfo) throw new BaseError('Unknown error. Try again later.')
      if (!walletData?.balance) throw new BaseError('Your current balance is undefined. Try again later.')

      const payload: TransferInput = {
        type: 'transfer',
        to: reviewStandardTransferInfo.walletAddress,
        amount: walletData?.balance,
        asset: 'XLM',
      }
      transfer.mutate(payload)
    } catch (error) {
      ErrorHandling.handleError({ error })
    }
  }

  const isLoadingBalance = useMemo(() => {
    if (typeof walletData?.balance === 'undefined') return true

    return getWallet.isLoading || getWallet.isError
  }, [getWallet.isError, getWallet.isLoading, walletData?.balance])

  return (
    <>
      <ConfirmTransferDrawer
        isOpen={!!reviewStandardTransferInfo}
        isTransferring={transfer.isPending}
        onClose={() => setReviewStandardTransferInfo(null)}
        onConfirm={() => handleStandardTransferConfirm()}
      />

      <TransferAssetsTemplate
        isLoadingBalance={isLoadingBalance}
        balanceAmount={walletData?.balance || 0}
        organizations={mockOrganizations}
        standardTransferForm={standardTransferForm}
        onOrganizationClick={handleOrganizationClick}
        onStandardTransferSubmit={handleStandardTransferSubmit}
      />
    </>
  )
}

export default TransferAssets
