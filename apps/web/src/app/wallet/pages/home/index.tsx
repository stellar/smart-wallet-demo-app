import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import { featureFlagsState } from 'src/app/core/helpers'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions, HomeTemplate } from './template'
import { useHandleAirdrop } from '../../hooks/use-handle-airdrop'
import { useHandleTransferLeftAssets } from '../../hooks/use-handle-transfer-left-assets'
import { useInitTransfer } from '../../hooks/use-init-transfer'
import { useGetWallet } from '../../queries/use-get-wallet'
import { homeRoute } from '../../routes'

export const Home = () => {
  const search = homeRoute.useSearch()
  const loaderDeps = homeRoute.useLoaderDeps()
  const navigate = useNavigate()

  const [isAirdropActive, isTransferLeftAssetsActive] = featureFlagsState(['airdrop', 'transfer-left-assets'])

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

  // Handle left transfer assets
  const { banner: transferLeftAssetsBanner } = useHandleTransferLeftAssets({
    enabled: isTransferLeftAssetsActive,
  })

  // Init transfer when search params are present (handles both transfer and NFT)
  useInitTransfer({
    params: search,
    enabled: loaderDeps.shouldInitTransfer,
  })

  const handleNavbarButtonClick = (item: 'nft' | 'history' | 'profile') => {
    if (item === 'profile') {
      navigate({ to: WalletPagesPath.PROFILE })
    } else if (item === 'history') {
      navigate({ to: WalletPagesPath.TRANSACTIONS })
    } else if (item === 'nft') {
      navigate({ to: WalletPagesPath.NFTS })
    }
  }

  const handleScanClick = () => navigate({ to: WalletPagesPath.SCAN })

  const handleSwagClick = () => navigate({ to: WalletPagesPath.SCAN })

  const swags: React.ComponentProps<typeof ImageCard>[] = useMemo(() => {
    return (walletData?.swags || []).map(swag => ({
      variant: swag.status === 'claimed' ? 'disabled' : 'enabled',
      imageUri: swag.imageUrl ?? 'unknown',
      name: swag.description ?? swag.name,
      leftBadge:
        swag.status === 'claimed'
          ? { label: c('walletHomeProductListLeftBadgeOptionALabel'), variant: 'disabled' }
          : { label: c('walletHomeProductListLeftBadgeOptionBLabel'), variant: 'success' },
      isClickable: false,
    }))
  }, [walletData?.swags])

  const isSwagActionButtonDisabled = useMemo(
    () => (walletData?.swags || []).every(swag => swag.status === 'claimed'),
    [walletData?.swags]
  )

  const isLoadingSwags = useMemo(() => {
    if (!walletData?.swags && loaderDeps.shouldInitTransfer) return true

    return getWallet.isLoading || getWallet.isError
  }, [getWallet.isError, getWallet.isLoading, loaderDeps.shouldInitTransfer, walletData?.swags])

  const isLoadingBalance = useMemo(() => {
    if (!walletData?.balance && loaderDeps.shouldInitTransfer) return true

    return getWallet.isLoading || getWallet.isError
  }, [getWallet.isError, getWallet.isLoading, loaderDeps.shouldInitTransfer, walletData?.balance])

  const banners = useMemo(() => {
    const bannersArray: BannerOptions[] = []
    if (airdropBanner) bannersArray.push(airdropBanner)
    if (transferLeftAssetsBanner) bannersArray.push(transferLeftAssetsBanner)
    return bannersArray
  }, [airdropBanner, transferLeftAssetsBanner])

  return (
    <HomeTemplate
      isLoadingBalance={isLoadingBalance}
      isLoadingSwags={isLoadingSwags}
      balanceAmount={walletData?.balance || 0}
      banners={banners}
      products={swags}
      isProductActionButtonDisabled={isSwagActionButtonDisabled}
      onNavbarButtonClick={handleNavbarButtonClick}
      onScanClick={handleScanClick}
      onProductActionButtonClick={handleSwagClick}
    />
  )
}
