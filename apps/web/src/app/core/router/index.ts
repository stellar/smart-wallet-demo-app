import { createRouter } from '@tanstack/react-router'

import { queryClient } from 'src/interfaces/query-client'

import { RouteLoading, RouteNotFound, RouteError } from './components'
import { routeTree } from './routeTree'

export const router = createRouter({
  routeTree,
  defaultPendingComponent: RouteLoading,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    client: queryClient,
  },
})
