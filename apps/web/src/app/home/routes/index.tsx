import { createRoute } from '@tanstack/react-router'

import { rootRoute } from 'src/app/core/router/routeTree'
import { ComingSoon } from 'src/app/home/pages'

import { HomePagesPath } from './types'

const comingSoonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: HomePagesPath.COMING_SOON,
  component: ComingSoon,
})

export const homeRoutes = [comingSoonRoute]
