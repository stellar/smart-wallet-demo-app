import '@tanstack/react-query'
import type { FetchQueryOptions } from '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface QueryClient {
    forceRefetch: <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
      options: FetchQueryOptions<TQueryFnData, TError, TData>
    ) => Promise<TData>
    clearExcept: (excludedKeys: QueryKey[][]) => void
  }
}
