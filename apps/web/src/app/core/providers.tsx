import { useEffect } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { toast } from 'react-toastify'

import { Toast } from 'src/app/core/services/toast'
import { Layout } from 'src/components/organisms/layout'
import { ModalProvider } from 'src/components/organisms/modal/provider'
import { ThemeProvider } from 'src/config/theme/provider'
import { isWebView, isWebAuthnSupported } from 'src/helpers/browser-environment'
import { c } from 'src/interfaces/cms/useContent'

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
        const copyToClipboard = async () => {
          try {
            await navigator.clipboard.writeText(window.location.href)
            Toast.notify({
              message: c('urlCopiedToClipboard'),
              type: Toast.toastType.SUCCESS,
              options: {
                autoClose: 2000,
              },
            })
          } catch (_error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = window.location.href
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)

            Toast.notify({
              message: c('urlCopiedToClipboard'),
              type: Toast.toastType.SUCCESS,
              options: {
                autoClose: 2000,
              },
            })
          }
        }

        Toast.notify({
          message: (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium">{c('webviewWarningTitle')}</div>
              <div className="flex flex-col gap-2">
                {c('webviewWarningButtonText')}
                <button
                  onClick={copyToClipboard}
                  className="text-sm text-gray-600 underline hover:text-gray-800 font-medium text-left"
                >
                  {c('webviewCopyUrlButtonText')}
                </button>
              </div>
            </div>
          ),
          type: Toast.toastType.WARNING,
          options: {
            autoClose: false,
            closeOnClick: false,
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
