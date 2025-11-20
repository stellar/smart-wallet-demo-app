import { Request, Response } from 'express'

import { Faq, FaqRepositoryType } from 'api/core/entities/faq/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import FaqRepository from 'api/core/services/faq'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetFaqs extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private faqRepository: FaqRepositoryType

  constructor(faqRepository?: FaqRepositoryType) {
    super()
    this.faqRepository = faqRepository || FaqRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponseFaqs(faqs: Faq[]) {
    return faqs.map(faq => ({
      id: faq.faqId,
      title: faq.title,
      description: faq.description,
      order: faq.order,
    }))
  }

  async handle() {
    const faqs = await this.faqRepository.getFaqs()

    return {
      data: {
        faqs: this.parseResponseFaqs(faqs),
      },
      message: 'Retrieved FAQs successfully',
    }
  }
}

export { endpoint }
