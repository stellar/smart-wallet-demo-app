import { Request, Response } from 'express'

import { Faq, FaqRepositoryType } from 'api/core/entities/faq/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import FaqRepository from 'api/core/services/faq'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/:id'

export class UpdateFaq extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private faqRepository: FaqRepositoryType

  constructor(faqRepository?: FaqRepositoryType) {
    super()
    this.faqRepository = faqRepository || FaqRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const faqId = request.params?.id
    const payload = { ...request.body, id: faqId } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponseFaq(faq: Faq) {
    return {
      title: faq.title,
      description: faq.description,
      order: faq.order,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const updatedFields = {
      title: validatedData.title,
      description: validatedData.description,
      order: validatedData.order,
    }

    const updatedFaq = await this.faqRepository.updateFaq(validatedData.id, updatedFields)

    return {
      data: {
        faq: this.parseResponseFaq(updatedFaq),
      },
      message: 'FAQ updated successfully',
    }
  }
}

export { endpoint }
