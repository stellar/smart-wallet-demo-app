import { Mocked } from 'vitest'

import { IWebAuthnService } from './types'

export function mockWebauthnService(): Mocked<IWebAuthnService> {
  return {
    createPasskey: vi.fn(),
    authenticateWithPasskey: vi.fn(),
  }
}
