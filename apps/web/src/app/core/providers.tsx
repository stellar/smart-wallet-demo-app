import { Toast } from 'src/app/core/services/toast'
import { DialogProvider } from 'src/components/molecules/dialog'

import { LayoutProvider } from './router/components/service'
import { ThemeProvider } from 'src/config/theme/provider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <Toast.Provider />
      <LayoutProvider>
        <DialogProvider>{children}</DialogProvider>
      </LayoutProvider>
    </ThemeProvider>
  )
}
