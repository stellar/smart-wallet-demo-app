import { Toast } from 'src/app/core/services/toast'
import { DialogProvider } from 'src/components/molecules/dialog'

import { QueryClientProvider } from './queries/client'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider>
      <Toast.Provider />
      <DialogProvider>{children}</DialogProvider>
    </QueryClientProvider>
  )
}
