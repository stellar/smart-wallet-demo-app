import { faqFactory } from 'api/core/entities/faq/factory'
import { mockFaqRepository } from 'api/core/services/faq/mock'

import { GetFaqs, endpoint } from './index'

const mockedFaqRepository = mockFaqRepository()

const faq1 = faqFactory({})
const faq2 = faqFactory({})

let useCase: GetFaqs

describe('GetFaqs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetFaqs(mockedFaqRepository)
  })

  it('should return faqs', async () => {
    mockedFaqRepository.getFaqs.mockResolvedValue([faq1, faq2])
    const result = await useCase.handle()

    expect(result.data.faqs).toEqual(useCase.parseResponseFaqs([faq1, faq2]))
    expect(result.message).toBe('Retrieved FAQs successfully')
  })

  it('should return faqs - empty case', async () => {
    mockedFaqRepository.getFaqs.mockResolvedValue([])
    const result = await useCase.handle()

    expect(result.data.faqs).toEqual([])
    expect(result.message).toBe('Retrieved FAQs successfully')
  })

  it('should parse faqs correctly', async () => {
    const parsedFaqs = useCase.parseResponseFaqs([faq1, faq2])

    expect(parsedFaqs).toEqual([
      {
        id: faq1.faqId,
        title: faq1.title,
        description: faq1.description,
        order: faq1.order,
      },
      {
        id: faq2.faqId,
        title: faq2.title,
        description: faq2.description,
        order: faq2.order,
      },
    ])
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
