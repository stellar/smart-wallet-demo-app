import { createRoute } from '@tanstack/react-router'
import { rootRoute } from 'src/app/core/router/routeTree'
import { Home } from 'src/app/wallet/pages'
import { WalletPagesPath } from './types'

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: WalletPagesPath.HOME,
  component: Home,
})

export const walletRoutes = [homeRoute]
