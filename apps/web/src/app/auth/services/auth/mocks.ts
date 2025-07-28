import { Mocked } from 'vitest'

import { IAuthService } from './types'

export function mockAuthService(): Mocked<IAuthService> {
  return {
    getInvitationInfo: vi.fn(),
    getRegisterOptions: vi.fn(),
    postRegister: vi.fn(),
    getLogInOptions: vi.fn(),
    postLogIn: vi.fn(),
  }
}
