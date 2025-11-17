import { Mocked } from 'vitest'

import { GiftReservationRepositoryType } from 'api/core/entities/gift-claim/types'

export function mockGiftReservationRepository(): Mocked<GiftReservationRepositoryType> {
  return {
    reserveGift: vi.fn(),
  }
}
