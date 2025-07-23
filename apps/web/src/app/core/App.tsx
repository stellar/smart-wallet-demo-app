import { RouterProvider } from '@tanstack/react-router'

import ErrorBoundary from './error-boundary'
import { Providers } from './providers'
import { router } from './router'

const App = (): JSX.Element => (
  <ErrorBoundary displayMessage="Ooooppss... An unexpected error occured">
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </ErrorBoundary>
)

export default App
