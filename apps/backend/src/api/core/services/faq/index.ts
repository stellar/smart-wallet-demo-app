import { FindManyOptions } from 'typeorm'

import { Faq as FaqModel } from 'api/core/entities/faq/model'
import { Faq, FaqRepositoryType } from 'api/core/entities/faq/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class FaqRepository extends SingletonBase implements FaqRepositoryType {
  constructor() {
    super()
  }

  async getFaqs(options?: FindManyOptions<Faq>): Promise<Faq[]> {
    return FaqModel.find(options ?? {})
  }

  async getFaqById(faqId: string): Promise<Faq | null> {
    return FaqModel.findOneBy({ faqId })
  }

  async createFaq(
    faq: {
      title: string
      description: string
      order?: number
    },
    save?: boolean
  ): Promise<Faq> {
    const newFaq = FaqModel.create({ ...faq })
    if (save) {
      return this.saveFaq(newFaq)
    }
    return newFaq
  }

  async updateFaq(faqId: string, data: Partial<Faq>): Promise<Faq> {
    await FaqModel.update(faqId, data)
    return this.getFaqById(faqId) as Promise<Faq>
  }

  async saveFaq(faq: Faq): Promise<Faq> {
    return FaqModel.save(faq)
  }
}
