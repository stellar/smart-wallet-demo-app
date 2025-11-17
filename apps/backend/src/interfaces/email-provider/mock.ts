import { Mocked } from 'vitest'

import { IEmailService } from './types'

export function mockEmailService(): Mocked<IEmailService> {
  return {
    sendEmail: vi.fn(),
  }
}
