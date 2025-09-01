import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ConfirmTransferDrawer, SelectAmountTransferDrawer } from 'src/app/wallet/components'
import {
  transferAmountFormSchema,
  TransferAmountFormValues,
} from 'src/app/wallet/components/select-amount-transfer-drawer/schema'
import { walletAddressFormSchema, WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { Organization } from 'src/app/wallet/domain/models/organization'
import { TransferInput } from 'src/app/wallet/domain/use-cases/transfer/types'
import { useGetOrganizations } from 'src/app/wallet/queries/use-get-organizations'
import { getWallet as getWalletQueryOptions, useGetWallet } from 'src/app/wallet/queries/use-get-wallet'
import { useTransfer } from 'src/app/wallet/queries/use-transfer'
import { ErrorHandling } from 'src/helpers/error-handling'
import BaseError from 'src/helpers/error-handling/base-error'
import { queryClient } from 'src/interfaces/query-client'

import TransferAssetsTemplate from './template'

export const TransferAssets = () => {
  const getWallet = useGetWallet()
  const walletData = getWallet.data
  const [reviewStandardTransferInfo, setReviewStandardTransferInfo] = useState<WalletAddressFormValues | null>(null)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)

  const organizationTransferForm = useForm<TransferAmountFormValues>({
    resolver: yupResolver(transferAmountFormSchema),
    mode: 'onSubmit',
  })
  const standardTransferForm = useForm<WalletAddressFormValues>({
    resolver: yupResolver(walletAddressFormSchema),
    mode: 'onSubmit',
  })

  const { data: getOrganizationsData, isLoading: isLoadingOrganizations } = useGetOrganizations()

  const organizations = getOrganizationsData?.data.ngos || []

  const transfer = useTransfer({
    onSuccess: () => {
      // TODO: show success modal
      queryClient.forceRefetch(getWalletQueryOptions())
      organizationTransferForm.reset()
      standardTransferForm.reset()
      setSelectedOrganization(null)
      setReviewStandardTransferInfo(null)
    },
  })

  const handleOrganizationClick = (organization: Organization) => {
    setSelectedOrganization(organization)
  }

  const handleStandardTransferSubmit = async (values: WalletAddressFormValues) => {
    setReviewStandardTransferInfo(values)
  }

  const handleOrganizationTransferConfirm = (values: TransferAmountFormValues) => {
    try {
      if (!selectedOrganization) throw new BaseError('Unknown error. Try again later.')
      if (!walletData?.balance) throw new BaseError('Your current balance is undefined. Try again later.')

      const payload: TransferInput = {
        type: 'transfer',
        to: selectedOrganization.wallet_address,
        amount: values.amount,
        asset: 'XLM',
      }
      transfer.mutate(payload)
    } catch (error) {
      ErrorHandling.handleError({ error })
    }
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
      <SelectAmountTransferDrawer
        isOpen={!!selectedOrganization}
        isTransferring={transfer.isPending}
        form={organizationTransferForm}
        target={selectedOrganization?.name || ''}
        balance={walletData?.balance || 0}
        onClose={() => setSelectedOrganization(null)}
        onConfirm={handleOrganizationTransferConfirm}
      />

      <ConfirmTransferDrawer
        isOpen={!!reviewStandardTransferInfo}
        isTransferring={transfer.isPending}
        onClose={() => setReviewStandardTransferInfo(null)}
        onConfirm={handleStandardTransferConfirm}
      />

      <TransferAssetsTemplate
        isLoadingBalance={isLoadingBalance}
        isLoadingOrganizations={isLoadingOrganizations}
        balanceAmount={walletData?.balance || 0}
        organizations={organizations}
        standardTransferForm={standardTransferForm}
        onOrganizationClick={handleOrganizationClick}
        onStandardTransferSubmit={handleStandardTransferSubmit}
      />
    </>
  )
}

export default TransferAssets
