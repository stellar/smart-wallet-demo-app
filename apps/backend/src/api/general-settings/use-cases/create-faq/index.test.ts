import { faqFactory } from 'api/core/entities/faq/factory'
import { mockFaqRepository } from 'api/core/services/faq/mock'

import { CreateFaq, endpoint } from './index'

const mockedFaqRepository = mockFaqRepository()

const mockedPayload = {
  title: 'FAQ Title',
  description: 'FAQ description',
  order: 1,
}

const newFaq = faqFactory({
  title: mockedPayload.title,
  description: mockedPayload.description,
  order: mockedPayload.order,
})

let useCase: CreateFaq

describe('CreateFaq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateFaq(mockedFaqRepository)
  })

  it('should create a faq', async () => {
    mockedFaqRepository.createFaq.mockResolvedValue(newFaq)
    const result = await useCase.handle(mockedPayload)

    expect(result.data.faq).toEqual(useCase.parseResponseFaq(newFaq))
    expect(result.message).toBe('FAQ created successfully')
  })

  it('should parse faq correctly', () => {
    const result = useCase.parseResponseFaq(newFaq)
    expect(result).toEqual({
      id: newFaq.faqId,
      title: newFaq.title,
      description: newFaq.description,
      order: newFaq.order,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
