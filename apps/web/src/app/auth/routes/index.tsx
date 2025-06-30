import { createRoute } from '@tanstack/react-router'
import { rootRoute } from 'src/app/core/router/routeTree'

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/welcome',
  component: () => <div>Welcome route</div>,
})

export const authRoutes = [welcomeRoute]
