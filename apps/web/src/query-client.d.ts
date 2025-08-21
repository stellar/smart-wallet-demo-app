import '@tanstack/react-query'
import type { FetchQueryOptions } from '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface QueryClient {
    /**
     * Same as fetchQuery but removes the query from cache first.
     * If the query is currently fetching, it will be cancelled.
     * @param options - The options to fetch the query with.
     * @returns A promise that resolves or rejects with the result of the query.
     */
    forceRefetch: <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
      options: FetchQueryOptions<TQueryFnData, TError, TData>
    ) => Promise<TData>

    /**
     * Clear all queries from the cache except the ones with the given keys.
     * @param excludedKeys - The keys of the queries to keep in the cache.
     * @returns void
     */
    clearExcept: (excludedKeys: QueryKey[][]) => void
  }
}
