import { Mocked } from 'vitest'

import { IWebAuthnRegistration } from './types'

export function mockWebAuthnRegistration(): Mocked<IWebAuthnRegistration> {
  return {
    generateOptions: vi.fn(),
    complete: vi.fn(),
  }
}
