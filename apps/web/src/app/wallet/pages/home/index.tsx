import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import { useFeatureFlagsState } from 'src/app/core/helpers'
import logger from 'src/app/core/services/logger'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions, FaqOptions, HomeTemplate } from './template'
import { useDeepLink } from '../../hooks/use-deep-link'
import { useFeatureFlagsRefetchOnFocus } from '../../hooks/use-feature-flags-refetch-on-focus'
import { useHandleAirdrop } from '../../hooks/use-handle-airdrop'
import { useHandleBehindScenes } from '../../hooks/use-handle-behind-scenes'
import { useHandleLeftSwags } from '../../hooks/use-handle-left-swags'
import { useHandleTransferLeftAssets } from '../../hooks/use-handle-transfer-left-assets'
import { useInitTransfer } from '../../hooks/use-init-transfer'
import { useGetWallet } from '../../queries/use-get-wallet'
import { homeRoute } from '../../routes'

export const Home = () => {
  const search = homeRoute.useSearch()
  const loaderDeps = homeRoute.useLoaderDeps()
  const navigate = useNavigate()

  const [isAirdropActive, isTransferLeftAssetsActive, isBehindScenesActive, isLeftSwagsActive] = useFeatureFlagsState([
    'airdrop',
    'transfer-left-assets',
    'behind-scenes',
    'left-swags',
  ])

  // Wallet information
  const getWallet = useGetWallet({
    enabled: !loaderDeps.shouldInitTransfer,
  })
  const walletData = getWallet.data
  const isUserAirdropAvailable = walletData ? walletData.is_airdrop_available : false
  const pendingLeftAssets = walletData?.token_balances
    ? walletData.token_balances.every(t => t.balance === 0) && walletData.balance === 0
    : false

  // Handle airdrop
  const { banner: airdropBanner } = useHandleAirdrop({
    enabled: isAirdropActive && isUserAirdropAvailable,
  })

  // Handle behind the scenes
  const { banner: behindScenesBanner } = useHandleBehindScenes({
    enabled: isBehindScenesActive,
  })

  // Handle left transfer assets
  const { banner: transferLeftAssetsBanner } = useHandleTransferLeftAssets({
    enabled: isTransferLeftAssetsActive && !getWallet.isLoading && !pendingLeftAssets,
  })

  const { banner: leftSwagsBanner } = useHandleLeftSwags({
    enabled: isLeftSwagsActive,
  })

  // Init transfer when search params are present (handles both transfer and NFT)
  useInitTransfer({
    params: search,
    enabled: loaderDeps.shouldInitTransfer,
  })

  // Redirect to deep link if available
  useDeepLink()

  // Refetch feature flags
  useFeatureFlagsRefetchOnFocus()

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

  const faq: FaqOptions = useMemo(() => {
    let faqItems: FaqOptions['items'] = []

    try {
      faqItems = JSON.parse(atob(import.meta.env.VITE_FAQ)).items
    } catch (error) {
      logger.error(`Failed to parse faq`, { error })
    }

    return {
      title: c('frequentlyAskedQuestions'),
      items: faqItems,
    }
  }, [])

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
    if (leftSwagsBanner) bannersArray.push(leftSwagsBanner)
    return bannersArray
  }, [airdropBanner, leftSwagsBanner])

  const topBanners = useMemo(() => {
    const bannersArray: BannerOptions[] = []
    if (behindScenesBanner) bannersArray.push(behindScenesBanner)
    if (transferLeftAssetsBanner) bannersArray.push(transferLeftAssetsBanner)
    return bannersArray
  }, [behindScenesBanner, transferLeftAssetsBanner])

  return (
    <HomeTemplate
      isLoadingBalance={isLoadingBalance}
      isLoadingSwags={isLoadingSwags}
      balanceAmount={walletData?.balance || 0}
      topBanners={topBanners}
      banners={banners}
      products={swags}
      isProductActionButtonDisabled={isSwagActionButtonDisabled}
      faq={faq}
      onNavbarButtonClick={handleNavbarButtonClick}
      onScanClick={handleScanClick}
      onProductActionButtonClick={handleSwagClick}
    />
  )
}
