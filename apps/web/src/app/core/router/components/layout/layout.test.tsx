import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Layout } from './index'
import { renderWithRouter, screen, waitFor } from 'src/helpers/tests'

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

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders mobile layout when useLayout returns "mobile"', () => {
    window.innerWidth = 500 // mobile

    renderWithRouter(<Layout />)

    waitFor(() => {
      expect(screen.getByTestId('sds-content')).toBeInTheDocument()
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
      // Check for mobile-specific classes
      const wrapper = screen.getByTestId('sds-content').closest('div')
      expect(wrapper).toHaveClass('flex', 'flex-col', 'h-screen', 'overflow-hidden')
    })
  })

  it('renders default layout when useLayout does not return "mobile"', async () => {
    window.innerWidth = 1000 // desktop

    renderWithRouter(<Layout />)

    expect(await screen.findByTestId('outlet')).toBeInTheDocument()
    expect(screen.queryByTestId('sds-content')).not.toBeInTheDocument()
  })
})
