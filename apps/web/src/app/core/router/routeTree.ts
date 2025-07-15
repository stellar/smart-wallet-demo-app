import { createRootRouteWithContext, ParsedLocation, redirect } from '@tanstack/react-router'
import { Layout } from './components/layout'
import { homeRoutes } from 'src/app/home/routes'
import { authRoutes } from 'src/app/auth/routes'
import { QueryClient } from '@tanstack/react-query'

export const rootRoute = createRootRouteWithContext<{ client: QueryClient }>()({
  component: Layout,
})

export const requireAuth = ({ location }: { location: ParsedLocation<object> }) => {
  {
    // TODO: manage user session
    if (false as const) {
      // Redirect them to the /welcome page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      throw redirect({
        to: '/welcome',
        search: {
          redirect: location.href,
        },
      })
    }
  }
}

export const routeTree = rootRoute.addChildren([...authRoutes, ...homeRoutes])
