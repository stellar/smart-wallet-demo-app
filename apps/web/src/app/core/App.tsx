import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'

import ErrorBoundary from './error-boundary'
import { Providers } from './providers'
import { router } from './router'

const App = (): JSX.Element => {
  useEffect(() => {
    const envTitle = import.meta.env.VITE_APP_TITLE || 'Smart Wallet | Secure & Easy Crypto Management'
    document.title = envTitle
  }, [])

  return (
    <ErrorBoundary displayMessage="Ooooppss... An unexpected error occured">
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  )
}

export default App
