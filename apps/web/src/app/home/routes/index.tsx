import { createRoute } from '@tanstack/react-router'

import { publicRootRoute } from 'src/app/core/router/routeTree'
import { ComingSoon } from 'src/app/home/pages'

import { HomePagesPath } from './types'

const comingSoonRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: HomePagesPath.COMING_SOON,
  component: ComingSoon,
})

export const homeRoutes = [comingSoonRoute]
