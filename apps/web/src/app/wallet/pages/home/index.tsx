import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { HomeTemplate } from './template'
import { useInitTransfer } from '../../hooks/use-init-transfer'
import { useGetWallet } from '../../queries/use-get-wallet'
import { homeRoute } from '../../routes'

export const Home = () => {
  const search = homeRoute.useSearch()
  const loaderDeps = homeRoute.useLoaderDeps()
  const navigate = useNavigate()

  const getWallet = useGetWallet({
    enabled: !loaderDeps.shouldInitTransfer,
  })

  const walletData = getWallet.data?.data

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

    return getWallet.isPending
  }, [getWallet.isPending, loaderDeps.shouldInitTransfer, walletData?.balance])

  return (
    <HomeTemplate
      isLoadingBalance={isLoadingBalance}
      balanceAmount={walletData?.balance || 0}
      onNavbarButtonClick={handleNavbarButtonClick}
      onPayClick={handlePayClick}
    />
  )
}
