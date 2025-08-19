import { createRoute } from '@tanstack/react-router'

import { privateRootRoute } from 'src/app/core/router/routeTree'
import { Home, Scan, Profile, Transactions, Nfts, SpecialGift } from 'src/app/wallet/pages'
import { sleepInSeconds } from 'src/helpers/sleep'
import { qrScanner } from 'src/interfaces/qr-scanner'

import { WalletRouteError, WalletRouteLoading } from './components'
import { WalletPagesPath } from './types'
import { nftTypeSchema, swagTypeSchema, transferTypeSchema } from '../pages/home/schema'
import { getWallet } from '../queries/use-get-wallet'
import { TransferTypes } from '../services/wallet/types'
import { useWalletStatusStore } from '../store/wallet-status'

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
})

const nftsRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.NFTS),
  component: Nfts,
})

const specialGiftRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: filterHomePath(WalletPagesPath.SPECIAL_GIFT),
  component: SpecialGift,
})

walletRootRoute.addChildren([homeRoute, scanRoute, profileRoute, transactionsRoute, nftsRoute, specialGiftRoute])

export const walletRoutes = [walletRootRoute]
