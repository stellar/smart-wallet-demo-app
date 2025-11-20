import { Request, Response } from 'express'

import { Faq, FaqRepositoryType } from 'api/core/entities/faq/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import FaqRepository from 'api/core/services/faq'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class CreateFaq extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private faqRepository: FaqRepositoryType

  constructor(faqRepository?: FaqRepositoryType) {
    super()
    this.faqRepository = faqRepository || FaqRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.CREATED).json(result)
  }

  parseResponseFaq(faq: Faq) {
    return {
      id: faq.faqId,
      title: faq.title,
      description: faq.description,
      order: faq.order,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const faq = {
      title: validatedData.title,
      description: validatedData.description,
      order: validatedData.order,
    }

    const newFaq = await this.faqRepository.createFaq(faq, true)

    return {
      data: {
        faq: this.parseResponseFaq(newFaq),
      },
      message: 'FAQ created successfully',
    }
  }
}

export { endpoint }
