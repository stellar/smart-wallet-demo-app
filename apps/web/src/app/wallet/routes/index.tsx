import { createRoute } from '@tanstack/react-router'

import { privateRootRoute } from 'src/app/core/router/routeTree'
import { Home } from 'src/app/wallet/pages'

import { WalletPagesPath } from './types'
import { getWallet } from '../queries/use-get-wallet'

const homeRoute = createRoute({
  getParentRoute: () => privateRootRoute,
  path: WalletPagesPath.HOME,
  component: Home,
  loader: ({ context }) => context.client.ensureQueryData(getWallet()),
})

export const walletRoutes = [homeRoute]
