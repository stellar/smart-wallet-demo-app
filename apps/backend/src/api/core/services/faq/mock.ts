import { Mocked } from 'vitest'

import { FaqRepositoryType } from 'api/core/entities/faq/types'

export function mockFaqRepository(): Mocked<FaqRepositoryType> {
  return {
    getFaqs: vi.fn(),
    getFaqById: vi.fn(),
    createFaq: vi.fn(),
    updateFaq: vi.fn(),
    saveFaq: vi.fn(),
  }
}
