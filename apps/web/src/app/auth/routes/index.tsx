import { createRoute } from '@tanstack/react-router'
import { rootRoute } from 'src/app/core/router/routeTree'
import { Invite } from '../pages/invite'

const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invite',
  component: Invite,
})

export const authRoutes = [inviteRoute]
