import { QueryClient } from '@tanstack/react-query'

import { ErrorHandling } from 'src/helpers/error-handling'

abstract class QueryClientSingleton {
  private static _instance: QueryClient

  protected constructor() {
    if (QueryClientSingleton._instance) {
      throw new Error('Use QueryClient.getInstance() instead of new.')
    }
  }

  public static getInstance(): QueryClient {
    if (!QueryClientSingleton._instance) {
      QueryClientSingleton._instance = new QueryClient({
        defaultOptions: {
          mutations: {
            onError: (error, context) => {
              ErrorHandling.handleError({
                error,
                context: typeof context === 'string' ? context : undefined,
              })
            },
          },
        },
      })
      QueryClientSingleton._instance.getQueryCache().subscribe(({ query }) => {
        if (query.state.status === 'error') {
          ErrorHandling.handleError({
            error: query.state.error,
            context: query.queryKey.join(' | '),
          })
        }
      })
    }
    return QueryClientSingleton._instance
  }
}

// Export the singleton instance directly
const queryClient = QueryClientSingleton.getInstance()

export { queryClient }
