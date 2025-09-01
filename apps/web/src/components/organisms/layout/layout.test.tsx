import { renderWithRouter, screen, waitFor } from 'src/helpers/tests'

import { Layout } from './index'

describe('Layout', () => {
  it('renders default layout when useLayout returns "mobile"', () => {
    window.innerWidth = 500 // mobile

    renderWithRouter(
      <Layout>
        <div data-testid="outlet" />
      </Layout>
    )

    waitFor(() => {
      expect(screen.getByTestId('sds-content')).toBeInTheDocument()
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
      // Check for mobile-specific classes
      const wrapper = screen.getByTestId('sds-content').closest('div')
      expect(wrapper).toHaveClass('relative', 'w-full', 'h-[100svh]', 'scrollbar-hide')
    })
  })

  it('renders default layout when useLayout does not return "mobile"', async () => {
    window.innerWidth = 1000 // desktop

    renderWithRouter(
      <Layout>
        <div data-testid="outlet" />
      </Layout>
    )

    waitFor(() => {
      expect(screen.getByTestId('sds-content')).toBeInTheDocument()
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
      // Check for mobile-specific classes
      const wrapper = screen.getByTestId('sds-content').closest('div')
      expect(wrapper).toHaveClass('relative', 'h-[100svh]', 'w-[768px]', 'mx-auto', 'scrollbar-hide')
    })
  })
})
