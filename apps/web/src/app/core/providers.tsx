import { Toast } from 'src/app/core/services/toast'
import { DialogProvider } from 'src/components/molecules/dialog'

import { QueryClientProvider } from './queries/client'
import { LayoutProvider } from './router/components/service'
import { ThemeProvider } from 'src/config/theme/provider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
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
