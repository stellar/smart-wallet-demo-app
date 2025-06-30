import { createRoute } from '@tanstack/react-router'
import { requireAuth, rootRoute } from 'src/app/core/router/routeTree'
import Dashboard from 'src/app/home/pages/dashboard'
import Home from 'src/app/home/pages/home'

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: args => requireAuth(args), // Ensure the user is authenticated before loading the dashboard
})

export const homeRoutes = [homeRoute, dashboardRoute]
