import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { walletAddressFormSchema, WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { useGetWallet } from 'src/app/wallet/queries/use-get-wallet'

import TransferAssetsTemplate, { Organization } from './template'

export const TransferAssets = () => {
  const getWallet = useGetWallet()
  const walletData = getWallet.data

  const standardTransferForm = useForm<WalletAddressFormValues>({
    resolver: yupResolver(walletAddressFormSchema),
    mode: 'onSubmit',
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

  const handleStandardTransferSubmit = async (_values: WalletAddressFormValues) => {
    // TODO: call transfer function
  }

  const isLoadingBalance = useMemo(() => {
    if (typeof walletData?.balance === 'undefined') return true

    return getWallet.isLoading || getWallet.isError
  }, [getWallet.isError, getWallet.isLoading, walletData?.balance])

  return (
    <TransferAssetsTemplate
      isLoadingBalance={isLoadingBalance}
      balanceAmount={walletData?.balance || 0}
      organizations={mockOrganizations}
      standardTransferForm={standardTransferForm}
      onOrganizationClick={handleOrganizationClick}
      onStandardTransferSubmit={handleStandardTransferSubmit}
    />
  )
}

export default TransferAssets
