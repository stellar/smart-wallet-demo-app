import { renderWithRouter, screen, waitFor } from 'src/helpers/tests'

import { RouteLayout } from './index'

// Mock Outlet
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')

  return { ...actual, Outlet: () => <div data-testid="outlet" /> }
})

// Mock SDSLayout.Content
vi.mock('@stellar/design-system', async () => {
  const actual = await vi.importActual('@stellar/design-system')

  return {
    ...actual,
    Layout: {
      Content: ({ children }: { children: React.ReactNode }) => <div data-testid="sds-content">{children}</div>,
    },
  }
})

describe('RouteLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.skip('renders layout successfully', () => {
    renderWithRouter(<RouteLayout />)

    waitFor(() => {
      expect(screen.getByTestId('sds-content')).toBeInTheDocument()
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })
  })
})
