import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LayoutProvider, useLayout } from './index'
import { renderWithoutProviders, screen, waitFor } from 'src/helpers/tests'
import { act } from 'react'

const TestComponent = () => {
  const layout = useLayout()
  return <div data-testid="layout">{layout}</div>
}

describe('LayoutProvider', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    window.innerWidth = originalInnerWidth
  })

  it('provides "mobile" layout when window.innerWidth < 768', () => {
    window.innerWidth = 500
    renderWithoutProviders(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    )
    expect(screen.getByTestId('layout').textContent).toBe('mobile')
  })

  it('provides "desktop" layout when window.innerWidth >= 768', () => {
    window.innerWidth = 1024
    renderWithoutProviders(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    )
    expect(screen.getByTestId('layout').textContent).toBe('desktop')
  })

  it('updates layout on window resize', async () => {
    window.innerWidth = 1024
    renderWithoutProviders(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    )
    expect(screen.getByTestId('layout').textContent).toBe('desktop')

    await act(async () => {
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('layout').textContent).toBe('mobile')
    })
  })

  it('removes resize event listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderWithoutProviders(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    )

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
