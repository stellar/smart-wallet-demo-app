import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import PullToRefresh from 'react-simple-pull-to-refresh'

import { useFeatureFlagsState } from 'src/app/core/helpers'
import { getFeatureFlags } from 'src/app/core/queries/use-get-feature-flags'
import logger from 'src/app/core/services/logger'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { Loading } from 'src/components/atoms'
import { ImageCard, VendorCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'
import { queryClient } from 'src/interfaces/query-client'

import { BannerOptions, FaqOptions, HomeTemplate } from './template'
import { useDeepLink } from '../../hooks/use-deep-link'
import { useFeatureFlagsRefetchOnFocus } from '../../hooks/use-feature-flags-refetch-on-focus'
import { useHandleAirdrop } from '../../hooks/use-handle-airdrop'
import { useHandleBehindScenes } from '../../hooks/use-handle-behind-scenes'
import { useHandleLeftSwags } from '../../hooks/use-handle-left-swags'
import { useHandleTransferLeftAssets } from '../../hooks/use-handle-transfer-left-assets'
import { useHandleWalletComingSoon } from '../../hooks/use-handle-wallet-coming-soon'
import { useInitTransfer } from '../../hooks/use-init-transfer'
import { getWallet, useGetWallet } from '../../queries/use-get-wallet'
import { homeRoute } from '../../routes'

export const Home = () => {
  const search = homeRoute.useSearch()
  const loaderDeps = homeRoute.useLoaderDeps()
  const navigate = useNavigate()

  const [
    isAirdropActive,
    isTransferLeftAssetsActive,
    isBehindScenesActive,
    isLeftSwagsActive,
    isWalletComingSoonActive,
  ] = useFeatureFlagsState(['airdrop', 'transfer-left-assets', 'behind-scenes', 'left-swags', 'wallet-coming-soon'])

  // Wallet information
  const getWalletQuery = useGetWallet({
    enabled: !loaderDeps.shouldInitTransfer,
  })
  const walletData = getWalletQuery.data
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
    enabled: isTransferLeftAssetsActive && !getWalletQuery.isLoading && !pendingLeftAssets,
  })

  // Handle left swags
  const { banner: leftSwagsBanner } = useHandleLeftSwags({
    enabled: isLeftSwagsActive,
  })

  const { banner: walletComingSoonBanner } = useHandleWalletComingSoon({
    enabled: isWalletComingSoonActive,
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

  const handleRefresh = useCallback(async () => {
    await Promise.allSettled([queryClient.forceRefetch(getWallet()), queryClient.forceRefetch(getFeatureFlags())])
  }, [])

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

  const vendors: React.ComponentProps<typeof VendorCard>[] = useMemo(() => {
    return (walletData?.vendors || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map(vendor => ({
        imageUri: vendor.profile_image ?? 'unknown',
        name: vendor.name,
        description: vendor.description,
      }))
  }, [walletData?.vendors])

  const isSwagActionButtonDisabled = useMemo(
    () => (walletData?.swags || []).every(swag => swag.status === 'claimed'),
    [walletData?.swags]
  )

  const isLoadingSwags = useMemo(() => {
    if (!walletData?.swags && loaderDeps.shouldInitTransfer) return true

    return getWalletQuery.isLoading || getWalletQuery.isError
  }, [getWalletQuery.isError, getWalletQuery.isLoading, loaderDeps.shouldInitTransfer, walletData?.swags])

  const isLoadingVendors = useMemo(() => {
    if (!walletData?.vendors && loaderDeps.shouldInitTransfer) return true

    return getWalletQuery.isLoading || getWalletQuery.isError
  }, [getWalletQuery.isError, getWalletQuery.isLoading, loaderDeps.shouldInitTransfer, walletData?.vendors])

  const isLoadingBalance = useMemo(() => {
    if (!walletData?.balance && loaderDeps.shouldInitTransfer) return true

    return getWalletQuery.isLoading || getWalletQuery.isError
  }, [getWalletQuery.isError, getWalletQuery.isLoading, loaderDeps.shouldInitTransfer, walletData?.balance])

  const banners = useMemo(() => {
    const bannersArray: BannerOptions[] = []
    if (airdropBanner) bannersArray.push(airdropBanner)
    if (leftSwagsBanner) bannersArray.push(leftSwagsBanner)
    return bannersArray
  }, [airdropBanner, leftSwagsBanner])

  const topBanners = useMemo(() => {
    const bannersArray: BannerOptions[] = []
    if (walletComingSoonBanner) bannersArray.push(walletComingSoonBanner)
    if (behindScenesBanner) bannersArray.push(behindScenesBanner)
    if (transferLeftAssetsBanner) bannersArray.push(transferLeftAssetsBanner)
    return bannersArray
  }, [walletComingSoonBanner, behindScenesBanner, transferLeftAssetsBanner])

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      refreshingContent={
        <div className="flex justify-center items-center mt-5">
          <Loading color="foregroundPrimary" size="sm" />
        </div>
      }
      pullingContent={<></>}
    >
      <HomeTemplate
        isLoadingBalance={isLoadingBalance}
        isLoadingSwags={isLoadingSwags}
        isLoadingVendors={isLoadingVendors}
        balanceAmount={walletData?.balance || 0}
        topBanners={topBanners}
        banners={banners}
        products={swags}
        vendors={vendors}
        isProductActionButtonDisabled={isSwagActionButtonDisabled}
        faq={faq}
        onNavbarButtonClick={handleNavbarButtonClick}
        onScanClick={handleScanClick}
        onProductActionButtonClick={handleSwagClick}
      />
    </PullToRefresh>
  )
}
