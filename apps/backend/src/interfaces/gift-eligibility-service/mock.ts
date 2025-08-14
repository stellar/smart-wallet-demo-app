import { Mocked } from 'vitest'

import { IGiftEligibilityService } from './index'

export function mockGiftEligibilityService(): Mocked<IGiftEligibilityService> {
  return {
    checkGiftEligibility: vi.fn(),
  }
}
