import { QueryClient, FetchQueryOptions, QueryKey } from '@tanstack/react-query'

import { ErrorHandling } from 'src/helpers/error-handling'

/**
 * Same as fetchQuery but removes the query from cache first.
 * If the query is currently fetching, it will be cancelled.
 * @param options - The options to fetch the query with.
 * @returns A promise that resolves or rejects with the result of the query.
 */
QueryClient.prototype.forceRefetch = async function <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  options: FetchQueryOptions<TQueryFnData, TError, TData>
): Promise<TData> {
  try {
    // 1. Mark query stale
    this.invalidateQueries({ queryKey: options.queryKey, exact: true })

    // 2. If query exists > force refetch
    const query = this.getQueryCache().find<TData>(options)
    if (query) {
      await this.refetchQueries({ queryKey: options.queryKey, exact: true }, { cancelRefetch: false })
      return query.state.data as TData
    }

    // 3. If query never existed > fetch it
    return await this.fetchQuery(options)
  } catch (error) {
    ErrorHandling.handleError({
      error,
      context: options.queryKey?.join(' | '),
    })
    throw error
  }
}

/**
 * Clear all queries from the cache except the ones with the given keys.
 * @param excludedKeys - The keys of the queries to keep in the cache.
 * @returns void
 */
QueryClient.prototype.clearExcept = function (excludedKeys: QueryKey[][]): void {
  const cache = this.getQueryCache()
  const queries = cache.getAll()

  for (const query of queries) {
    const shouldExclude = excludedKeys.some(key => JSON.stringify(query.queryKey) === JSON.stringify(key))

    if (!shouldExclude) cache.remove(query)
  }
}

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
