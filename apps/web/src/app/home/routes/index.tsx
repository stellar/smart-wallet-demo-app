import { createRoute } from '@tanstack/react-router'
import { rootRoute } from 'src/app/core/router/routeTree'
import { Home, ComingSoon } from 'src/app/home/pages'
import { HomePagesPath } from './types'

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: HomePagesPath.HOME,
  component: Home,
})

const comingSoonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: HomePagesPath.COMING_SOON,
  component: ComingSoon,
})

export const homeRoutes = [homeRoute, comingSoonRoute]
