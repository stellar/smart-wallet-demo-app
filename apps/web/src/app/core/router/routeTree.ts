import { createRootRoute, ParsedLocation, redirect } from '@tanstack/react-router'
import { Layout } from './components/layout'
import { homeRoutes } from 'src/app/home/routes'
import { authRoutes } from 'src/app/auth/routes'
import { useAuthStore } from 'src/app/auth/store/auth-store'

export const rootRoute = createRootRoute({
  component: Layout,
})

export const requireAuth = ({ location }: { location: ParsedLocation<object> }) => {
  {
    const { isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated()) {
      // Redirect them to the /signin page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      })
    }
  }
}

export const routeTree = rootRoute.addChildren([...authRoutes, ...homeRoutes])
