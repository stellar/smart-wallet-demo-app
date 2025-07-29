import { Mocked } from 'vitest'

import { IWebAuthnAuthentication } from './types'

export function mockWebAuthnAuthentication(): Mocked<IWebAuthnAuthentication> {
  return {
    generateOptions: vi.fn(),
    complete: vi.fn(),
  }
}
