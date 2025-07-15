import { FC, PropsWithChildren, ReactElement } from 'react'

import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

import { Providers } from 'src/app/core/providers'
import { routeTree } from 'src/app/core/router/routeTree'

type CustomRenderFunction = (ui: ReactElement, options?: Omit<RenderOptions, 'queries'>) => RenderResult

// If the application has providers, you can add them in the wrapper below
const ApplicationProviders: FC<PropsWithChildren> = ({ children }) => <Providers>{children}</Providers>

const ApplicationProvidersWithRouter: FC<PropsWithChildren> = ({ children }) => {
  const router = createRouter({
    routeTree,
    defaultComponent: () => <div>{children}</div>,
    context: {
      client: new QueryClient(),
    },
  })

  return (
    <ApplicationProviders>
      <RouterProvider router={router} />
    </ApplicationProviders>
  )
}

const customRender: CustomRenderFunction = (ui, options?) => render(ui, { wrapper: ApplicationProviders, ...options })

const renderWithoutProviders: CustomRenderFunction = (ui, options?) => render(ui, options)

// Needed to either navigate between routes or render 'react-router-dom' child components such as Link
const renderWithRouter: CustomRenderFunction = (ui, options?) =>
  render(ui, { wrapper: ApplicationProvidersWithRouter, ...options })

// Only export the needed testing-library exports, excluding 'render' to avoid conflicts
export {
  screen,
  fireEvent,
  waitFor,
  act,
  // add any other exports you need from '@testing-library/react'
} from '@testing-library/react'
export { customRender as render, renderWithoutProviders, renderWithRouter }
