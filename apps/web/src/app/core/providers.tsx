import { useEffect } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { toast } from 'react-toastify'

import { Toast } from 'src/app/core/services/toast'
import { Layout } from 'src/components/organisms/layout'
import { ModalProvider } from 'src/components/organisms/modal/provider'
import { ThemeProvider } from 'src/config/theme/provider'
import { isWebView, isWebAuthnSupported, openInNativeBrowser } from 'src/helpers/browser-environment'

import { QueryClientProvider } from './queries/client'
import { LayoutProvider } from '../../interfaces/layout'
import { useSyncAccessToken } from '../auth/hooks/use-sync-access-token'

// Global state to prevent duplicate toasts
const WEBVIEW_TOAST_ID = 'webview-environment-warning'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useSyncAccessToken()

  // Global webview detection - shows toast when app loads or refreshes
  useEffect(() => {
    const checkEnvironment = async () => {
      // Check if toast is already active
      if (toast.isActive(WEBVIEW_TOAST_ID)) {
        return
      }

      const webAuthnSupported = await isWebAuthnSupported()
      const isWebViewEnvironment = isWebView()

      if (isWebViewEnvironment && !webAuthnSupported) {
        Toast.notify({
          message: (
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">WebAuthn/Passkey not supported in this environment</div>
              <button
                onClick={openInNativeBrowser}
                className="text-sm text-blue-600 underline hover:text-blue-800 font-medium"
              >
                Open in native browser for full functionality
              </button>
            </div>
          ),
          type: Toast.toastType.WARNING,
          options: {
            autoClose: 8000,
            closeOnClick: true,
            toastId: WEBVIEW_TOAST_ID,
          },
        })
      }
    }

    checkEnvironment()
  }, [])

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
