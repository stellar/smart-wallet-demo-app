import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, createRoute, redirect } from '@tanstack/react-router'

import { authRoutes } from 'src/app/auth/routes'
import { AuthPagesPath } from 'src/app/auth/routes/types'
import { useAccessTokenStore } from 'src/app/auth/store'
import { homeRoutes } from 'src/app/home/routes'
import { HomePagesPath } from 'src/app/home/routes/types'
import { walletRoutes } from 'src/app/wallet/routes'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { a } from 'src/interfaces/cms/useAssets'
import { useLayoutStore } from 'src/store'

import { featureFlagsState } from '../helpers'
import { RouteLayout } from './components/route-layout'
import { getFeatureFlags } from '../queries/use-get-feature-flags'
import { preloadImages } from '../utils/preload'

export const rootRoute = createRootRouteWithContext<{ client: QueryClient }>()({
  component: RouteLayout,
  beforeLoad: async ({ context }) => {
    // Preload images
    preloadImages([a('blackLogo'), a('yellowLogo'), a('horizontalLogo')])

    // Fetch feature flags
    await context.client.ensureQueryData(getFeatureFlags())
  },
})

// Public routes
export const publicRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  beforeLoad: ({ location }) => {
    // Preload images
    const layout = useLayoutStore.getState().layout
    if (layout === 'desktop') {
      preloadImages([a('onboardingDesktopBackground'), a('onboardingBrandLogo')])
    } else {
      preloadImages([a('onboardingBackground'), a('onboardingBrandLogo')])
    }

    const accessTokenStore = useAccessTokenStore.getState()
    const isAuthenticated = !!accessTokenStore.accessToken

    // If the user is authenticated, redirect to the home page
    if (isAuthenticated) {
      throw redirect({
        to: WalletPagesPath.HOME,
      })
    }

    const [isComingSoonActive] = featureFlagsState(['coming-soon'])
    const comingSoonPath = HomePagesPath.COMING_SOON

    if (isComingSoonActive && location.href !== comingSoonPath) {
      throw redirect({
        to: comingSoonPath,
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
