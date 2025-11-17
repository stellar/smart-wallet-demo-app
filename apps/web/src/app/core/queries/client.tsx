import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'

import { queryClient } from 'src/interfaces/query-client'

export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>
}
