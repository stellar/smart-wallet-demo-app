import { RouterProvider } from '@tanstack/react-router'

import ErrorBoundary from './error-boundary'
import { Providers } from './providers'
import { router } from './router'
import { useSyncAccessToken } from '../auth/hooks/use-sync-access-token'

const App = (): JSX.Element => {
  useSyncAccessToken()

  return (
    <ErrorBoundary displayMessage="Ooooppss... An unexpected error occured">
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  )
}

export default App
