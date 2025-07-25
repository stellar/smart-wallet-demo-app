import { createRoute } from '@tanstack/react-router'

import { privateRootRoute } from 'src/app/core/router/routeTree'
import { Home, Scan, Profile } from 'src/app/wallet/pages'
import { qrScanner } from 'src/interfaces/qr-scanner'

import { WalletPagesPath } from './types'
import { getWallet } from '../queries/use-get-wallet'

const filterHomePath = (path: WalletPagesPath): string => path.split(WalletPagesPath.HOME)[1]

const walletRootRoute = createRoute({
  getParentRoute: () => privateRootRoute,
  path: WalletPagesPath.HOME,
})

const homeRoute = createRoute({
  getParentRoute: () => walletRootRoute,
  path: '/',
  component: Home,
  loader: ({ context }) => context.client.ensureQueryData(getWallet()),
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
  loader: ({ context }) => context.client.ensureQueryData(getWallet()),
})

walletRootRoute.addChildren([homeRoute, scanRoute, profileRoute])

export const walletRoutes = [walletRootRoute]
