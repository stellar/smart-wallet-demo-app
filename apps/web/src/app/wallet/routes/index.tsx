import { createRoute, ErrorComponent, redirect } from '@tanstack/react-router'
import * as yup from 'yup'

import { featureFlagsState } from 'src/app/core/helpers'
import { privateRootRoute } from 'src/app/core/router/routeTree'
import { preloadImages } from 'src/app/core/utils/preload'
import { Home, Scan, Profile, Transactions, Nfts, LeftAssets, SpecialGift } from 'src/app/wallet/pages'
import { OnboardingStyleVariant } from 'src/constants/theme/onboarding-style'
import { checkImageExists } from 'src/helpers/check-image-exists'
import { sleepInSeconds } from 'src/helpers/sleep'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'
import { qrScanner } from 'src/interfaces/qr-scanner'

import { WalletRouteError, WalletRouteLoading } from './components'
import { WalletPagesPath } from './types'
import { nftTypeSchema, swagTypeSchema, transferTypeSchema } from '../pages/home/schema'
import { getWallet } from '../queries/use-get-wallet'
import { TransferTypes } from '../services/wallet/types'
import { useWalletStatusStore } from '../store'

const filterHomePath = (path: WalletPagesPath): string => path.split(WalletPagesPath.HOME)[1]

const walletRootRoute = createRoute({
  getParentRoute: () => privateRootRoute,
  path: WalletPagesPath.HOME,
  pendingComponent: WalletRouteLoading,
  errorComponent: WalletRouteError,
  loaderDeps: () => ({ walletStatus: useWalletStatusStore.getState().status }),
  loader: async ({ context, deps }) => {
    // Exit if wallet is already initialized
    if (deps.walletStatus === 'SUCCESS') return

    const maxRetries = 10
    for (let i = 0; i < maxRetries; i++) {
      // Check wallet status
      const getWalletResult = await context.client.fetchQuery(getWallet())
      const walletStatus = getWalletResult.status

      // Exit loop if wallet is initialized
      if (walletStatus === 'SUCCESS') return

      // Throw error if wallet setup failed
      if (walletStatus === 'FAILED') throw new Error('Wallet setup failed')

      context.client.removeQueries(getWallet())
      await sleepInSeconds(1)
    }

    // Create a promise that never resolves (keep the route loading alive)
    // eslint-disable-next-line no-empty-function
    return new Promise(() => {})
  },
})

export const homeRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: '/',
  component: Home,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  validateSearch: search => {
    switch (search.type as TransferTypes) {
      case 'transfer':
        return transferTypeSchema.validateSync(search)
      case 'nft':
        return nftTypeSchema.validateSync(search)
      case 'swag':
        return swagTypeSchema.validateSync(search)
    }
  },
  loaderDeps: ({ search }) => ({
    shouldInitTransfer: !!search.type,
  }),
  beforeLoad: () => {
    // Preload images
    preloadImages([
      a('airdropBannerBackground'),
      a('airdropDefaultBackground'),
      a('transferLeftAssetsBannerBackground'),
      a('transferLeftAssetsDefaultBackground'),
      a('behindScenesBannerBackground'),
      a('behindScenesDefaultBackground'),
      a('leftSwagsBannerBackground'),
      a('nftModalBackground'),
      a('customNftModalBackground'),
    ])
  },
})

const scanRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.SCAN),
  component: Scan,
  onLeave: async () => {
    await qrScanner.stop()
  },
})

const profileRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.PROFILE),
  component: Profile,
})

const transactionsRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.TRANSACTIONS),
  component: Transactions,
  beforeLoad: () => {
    // Preload images
    preloadImages([a('transactionsHistoryListMintBackground'), a('transactionsHistoryMintBackground'), a('emptyList')])
  },
})

const nftsRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.NFTS),
  component: Nfts,
  beforeLoad: () => {
    // Preload images
    preloadImages([a('emptyList')])
  },
})

export const leftAssetsRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.LEFT_ASSETS),
  component: LeftAssets,
  validateSearch: search =>
    yup
      .object({
        tab: yup.string(),
      })
      .validateSync(search),
  beforeLoad: () => {
    const [isTransferLeftAssetsActive] = featureFlagsState(['transfer-left-assets'])

    // Redirect to home page if feature flag is disabled
    if (!isTransferLeftAssetsActive) {
      throw redirect({
        to: WalletPagesPath.HOME,
      })
    }
  },
})

export const specialGiftRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.SPECIAL_GIFT),
  component: SpecialGift,
  pendingComponent: () => (
    <WalletRouteLoading
      onboardingStyleVariant={import.meta.env.VITE_ONBOARDING_STYLE_VARIANT as OnboardingStyleVariant}
      overrideDescription={c('specialGiftRouteLoadingDescription')}
    />
  ),
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  validateSearch: search =>
    yup
      .object({
        photo_id: yup.string().required(),
      })
      .validateSync(search),
  loaderDeps: ({ search }) => ({
    photo_id: search.photo_id,
  }),
  beforeLoad: () => {
    // Preload images
    preloadImages([a('specialGiftBox'), a('specialGiftModalBackground')])
  },
  loader: async ({ deps }) => {
    const url = `${import.meta.env.VITE_GIFT_STORAGE_BASE_URL}/${deps.photo_id}.jpg`
    const maxRetries = 10
    for (let i = 0; i < maxRetries; i++) {
      try {
        await checkImageExists(url)
        return { url }
      } catch {
        await sleepInSeconds(1)
      }
    }
    throw new Error('Photo not found. Please try again later.')
  },
})

walletRootRoute.addChildren([
  homeRoute,
  scanRoute,
  profileRoute,
  transactionsRoute,
  nftsRoute,
  leftAssetsRoute,
  specialGiftRoute,
])

export const walletRoutes = [walletRootRoute]
