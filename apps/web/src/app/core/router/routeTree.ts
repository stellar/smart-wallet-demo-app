import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, createRoute, redirect } from '@tanstack/react-router'

import { authRoutes } from 'src/app/auth/routes'
import { AuthPagesPath } from 'src/app/auth/routes/types'
import { useAccessTokenStore } from 'src/app/auth/store'
import { homeRoutes } from 'src/app/home/routes'
import { walletRoutes } from 'src/app/wallet/routes'
import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { Layout } from './components/layout'

export const rootRoute = createRootRouteWithContext<{ client: QueryClient }>()({
  component: Layout,
})

// Public routes
export const publicRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  beforeLoad: () => {
    const accessTokenStore = useAccessTokenStore.getState()
    const isAuthenticated = !!accessTokenStore.accessToken

    // If the user is authenticated, redirect to the home page
    if (isAuthenticated) {
      throw redirect({
        to: WalletPagesPath.HOME,
      })
    }
  },
})

// Private routes
export const privateRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'private',
  beforeLoad: ({ location }) => {
    const accessTokenStore = useAccessTokenStore.getState()
    const isAuthenticated = !!accessTokenStore.accessToken

    if (!isAuthenticated) {
      // Redirect them to the login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      throw redirect({
        to: AuthPagesPath.LOGIN,
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

publicRootRoute.addChildren([...authRoutes, ...homeRoutes])
privateRootRoute.addChildren([...walletRoutes])

export const routeTree = rootRoute.addChildren([publicRootRoute, privateRootRoute])
