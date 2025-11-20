import { FindManyOptions } from 'typeorm'

import { Faq as FaqModel } from 'api/core/entities/faq/model'

export type Faq = FaqModel

export type FaqRepositoryType = {
  getFaqs(options?: FindManyOptions<Faq>): Promise<Faq[]>
  getFaqById(faqId: string): Promise<Faq | null>
  createFaq(
    faq: {
      title: string
      description: string
      order?: number
    },
    save?: boolean
  ): Promise<Faq>
  updateFaq(faqId: string, data: Partial<Faq>): Promise<Faq>
  saveFaq(faq: Faq): Promise<Faq>
  deleteFaq(faqId: string): Promise<void>
}
