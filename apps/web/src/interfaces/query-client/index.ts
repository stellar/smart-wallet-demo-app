import { QueryClient } from '@tanstack/react-query'

abstract class QueryClientSingleton {
  private static _instance: QueryClient

  protected constructor() {
    if (QueryClientSingleton._instance) {
      throw new Error('Use QueryClient.getInstance() instead of new.')
    }
  }

  public static getInstance(): QueryClient {
    if (!QueryClientSingleton._instance) {
      QueryClientSingleton._instance = new QueryClient()
    }
    return QueryClientSingleton._instance
  }
}

// Export the singleton instance directly
const queryClient = QueryClientSingleton.getInstance()

export { queryClient }
