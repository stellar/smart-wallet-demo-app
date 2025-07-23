import { Mocked } from 'vitest'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
export function mockOtpRepository(): Mocked<OtpRepositoryType> {
  return {
    getOtpByCode: vi.fn(),
    createOtp: vi.fn(),
    saveOtp: vi.fn(),
  }
}
