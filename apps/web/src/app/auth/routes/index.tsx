import { createRoute } from '@tanstack/react-router'
import { SignIn } from 'src/app/auth/pages/signin'
import { rootRoute } from 'src/app/core/router/routeTree'

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignIn,
})

export const authRoutes = [signInRoute]
