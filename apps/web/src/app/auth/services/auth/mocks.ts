import { Mocked } from 'vitest'

import { IAuthService } from './types'

export function mockAuthService(): Mocked<IAuthService> {
  return {
    getInvitationInfo: vi.fn(),
    getRegisterOptions: vi.fn(),
    postRegister: vi.fn(),
    getLogInOptions: vi.fn(),
    postLogIn: vi.fn(),
    sendRecoveryLink: vi.fn(),
    validateRecoveryLink: vi.fn(),
    getRecoverWalletOptions: vi.fn(),
    postRecoverWallet: vi.fn(),
    resendInviteLink: vi.fn(),
  }
}
