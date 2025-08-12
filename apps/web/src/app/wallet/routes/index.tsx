import { createRoute } from '@tanstack/react-router'

import { privateRootRoute } from 'src/app/core/router/routeTree'
import { Home, Scan, Profile, Transactions, Nfts, SpecialGift } from 'src/app/wallet/pages'
import { qrScanner } from 'src/interfaces/qr-scanner'

import { WalletPagesPath } from './types'
import { nftTypeSchema, transferTypeSchema } from '../pages/home/schema'
import { TransferTypes } from '../services/wallet/types'

const filterHomePath = (path: WalletPagesPath): string => path.split(WalletPagesPath.HOME)[1]

const walletRootRoute = createRoute({
  getParentRoute: () => privateRootRoute,
  path: WalletPagesPath.HOME,
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
