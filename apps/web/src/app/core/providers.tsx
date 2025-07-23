import { Toast } from 'src/app/core/services/toast'
import { ModalProvider } from 'src/components/molecules/modal/provider'
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
          <ModalProvider>{children}</ModalProvider>
        </LayoutProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
