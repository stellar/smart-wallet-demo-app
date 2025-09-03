// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'vitest-canvas-mock'

// SDS MOCK
vi.mock('@stellar/design-system', async () => {
  const actual = await vi.importActual<typeof import('@stellar/design-system')>('@stellar/design-system')

  const iconKeys = Object.keys(actual.Icon ?? {})
  const mockedIcons = Object.fromEntries(iconKeys.map(key => [key, key]))

  return {
    ...actual,
    Icon: mockedIcons,
    CopyText: ({ children }: { children: React.ReactNode }) => children,
  }
})

// MOCKS
vi.mock('src/app/core/services/general-settings', async () => {
  const actual = await vi.importActual<typeof import('src/app/core/services/general-settings')>(
    'src/app/core/services/general-settings'
  )

  return {
    ...actual,
    generalSettingsService: {
      getFeatureFlags: vi.fn(),
    },
  }
})

// GLOBAL MOCKS
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

class MockPointerEvent extends Event {
  button: number
  ctrlKey: boolean
  pointerType: string

  constructor(type: string, props: PointerEventInit) {
    super(type, props)
    this.button = props.button || 0
    this.ctrlKey = props.ctrlKey || false
    this.pointerType = props.pointerType || 'mouse'
  }
}

window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent
window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
