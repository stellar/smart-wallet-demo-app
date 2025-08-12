import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import { featureFlagsState } from 'src/app/core/helpers'
import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { HomeTemplate } from './template'
import { useHandleAirdrop } from '../../hooks/use-handle-airdrop'
import { useInitTransfer } from '../../hooks/use-init-transfer'
import { useGetWallet } from '../../queries/use-get-wallet'
import { homeRoute } from '../../routes'

export const Home = () => {
  const search = homeRoute.useSearch()
  const loaderDeps = homeRoute.useLoaderDeps()
  const navigate = useNavigate()

  const [isAirdropActive] = featureFlagsState(['airdrop'])

  // Wallet information
  const getWallet = useGetWallet({
    enabled: !loaderDeps.shouldInitTransfer,
  })
  const walletData = getWallet.data
  const isUserAirdropAvailable = walletData ? walletData.is_airdrop_available : false

  // Handle airdrop
  const { banner: airdropBanner } = useHandleAirdrop({
    enabled: isAirdropActive && isUserAirdropAvailable,
  })

  // Init transfer when search params are present
  useInitTransfer({
    params: search,
    enabled: loaderDeps.shouldInitTransfer,
  })

  const handlePayClick = () => navigate({ to: WalletPagesPath.SCAN })

  const handleNavbarButtonClick = (item: 'nft' | 'history' | 'profile') => {
    if (item === 'profile') {
      navigate({ to: WalletPagesPath.PROFILE })
    } else if (item === 'history') {
      navigate({ to: WalletPagesPath.TRANSACTIONS })
    } else if (item === 'nft') {
      navigate({ to: WalletPagesPath.NFTS })
    }
  }

  const isLoadingBalance = useMemo(() => {
    if (!walletData?.balance && loaderDeps.shouldInitTransfer) return true

    return getWallet.isPending || getWallet.isError
  }, [getWallet.isError, getWallet.isPending, loaderDeps.shouldInitTransfer, walletData?.balance])

  return (
    <HomeTemplate
      isLoadingBalance={isLoadingBalance}
      balanceAmount={walletData?.balance || 0}
      banner={airdropBanner}
      onNavbarButtonClick={handleNavbarButtonClick}
      onPayClick={handlePayClick}
    />
  )
}
