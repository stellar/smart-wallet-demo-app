import { Request, Response } from 'express'

import { FaqRepositoryType } from 'api/core/entities/faq/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import FaqRepository from 'api/core/services/faq'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/:id'

export class DeleteFaq extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private faqRepository: FaqRepositoryType

  constructor(faqRepository?: FaqRepositoryType) {
    super()
    this.faqRepository = faqRepository || FaqRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const faqId = request.params?.id
    const payload = { id: faqId } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    await this.faqRepository.deleteFaq(validatedData.id)

    return {
      data: {},
      message: 'FAQ deleted successfully',
    }
  }
}

export { endpoint }
