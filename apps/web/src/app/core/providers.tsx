import { Toast } from 'src/app/core/services/toast'
import { DialogProvider } from 'src/components/molecules/dialog'
import { ThemeProvider } from 'src/config/theme/provider'

import { QueryClientProvider } from './queries/client'
import { LayoutProvider } from './router/components/service'
import { useSyncAccessToken } from '../auth/hooks/use-sync-access-token'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useSyncAccessToken()

  return (
    <QueryClientProvider>
      <ThemeProvider>
        <Toast.Provider />
        <LayoutProvider>
          <DialogProvider>{children}</DialogProvider>
        </LayoutProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
