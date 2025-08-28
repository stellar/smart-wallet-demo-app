import { SkeletonTheme } from 'react-loading-skeleton'

import { Toast } from 'src/app/core/services/toast'
import { Layout } from 'src/components/organisms/layout'
import { ModalProvider } from 'src/components/organisms/modal/provider'
import { ThemeProvider } from 'src/config/theme/provider'

import { QueryClientProvider } from './queries/client'
import { LayoutProvider } from '../../interfaces/layout'
import { useSyncAccessToken } from '../auth/hooks/use-sync-access-token'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useSyncAccessToken()

  return (
    <QueryClientProvider>
      <ThemeProvider>
        <LayoutProvider>
          <Layout>
            <SkeletonTheme>
              <Toast.Provider />
              <ModalProvider>{children}</ModalProvider>
            </SkeletonTheme>
          </Layout>
        </LayoutProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
