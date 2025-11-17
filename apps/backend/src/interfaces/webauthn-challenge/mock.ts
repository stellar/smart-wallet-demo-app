import { Mocked } from 'vitest'

import { IWebauthnChallengeService } from './types'

export function mockWebauthnChallenge(): Mocked<IWebauthnChallengeService> {
  return {
    createChallenge: vi.fn(),
    storeChallenge: vi.fn(),
    setMetadata: vi.fn(),
    getChallenge: vi.fn(),
    deleteChallenge: vi.fn(),
  }
}
