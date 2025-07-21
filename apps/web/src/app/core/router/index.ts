import { createRouter } from '@tanstack/react-router'

import { queryClient } from 'src/interfaces/query-client'

import { routeTree } from './routeTree'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    client: queryClient,
  },
})
