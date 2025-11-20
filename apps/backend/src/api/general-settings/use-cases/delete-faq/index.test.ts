import { faqFactory } from 'api/core/entities/faq/factory'
import { mockFaqRepository } from 'api/core/services/faq/mock'

import { DeleteFaq, endpoint } from './index'

const mockedFaqRepository = mockFaqRepository()

const mockedFaq = faqFactory({
  title: 'Test FAQ',
  description: 'Test FAQ description',
  order: 1,
})

let useCase: DeleteFaq

describe('DeleteFaq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new DeleteFaq(mockedFaqRepository)
  })

  it('should delete a faq', async () => {
    mockedFaqRepository.deleteFaq.mockResolvedValue(undefined)
    const result = await useCase.handle({ id: mockedFaq.faqId })

    expect(mockedFaqRepository.deleteFaq).toHaveBeenCalledWith(mockedFaq.faqId)
    expect(result.data).toEqual({})
    expect(result.message).toBe('FAQ deleted successfully')
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/:id')
  })
})
