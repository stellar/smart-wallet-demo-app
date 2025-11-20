import { faqFactory } from 'api/core/entities/faq/factory'
import { Faq } from 'api/core/entities/faq/types'
import { mockFaqRepository } from 'api/core/services/faq/mock'

import { UpdateFaq, endpoint } from './index'

const mockedFaqRepository = mockFaqRepository()

const mockedFaq = faqFactory({
  title: 'New FAQ',
  description: 'New FAQ description',
  order: 1,
})

let useCase: UpdateFaq

describe('UpdateFaq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new UpdateFaq(mockedFaqRepository)
  })

  it('should update a faq', async () => {
    const updatedFaq = {
      ...mockedFaq,
      title: 'Updated FAQ',
    } as Faq

    mockedFaqRepository.updateFaq.mockResolvedValue(updatedFaq)
    const result = await useCase.handle({ id: mockedFaq.faqId, title: 'Updated FAQ' })

    expect(result.data.faq).toEqual(useCase.parseResponseFaq(updatedFaq))
    expect(result.message).toBe('FAQ updated successfully')
  })

  it('should parse a faq correctly', () => {
    const result = useCase.parseResponseFaq(mockedFaq)
    expect(result).toEqual({
      title: mockedFaq.title,
      description: mockedFaq.description,
      order: mockedFaq.order,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/:id')
  })
})
