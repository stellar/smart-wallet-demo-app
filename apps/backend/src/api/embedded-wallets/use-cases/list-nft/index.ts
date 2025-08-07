import { Request, Response } from 'express'

import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/nft'

export class ListNft extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  handle(...params: unknown[]): Promise<string | { message: string; data?: any } | {}> {
    throw new Error('Method not implemented.')
  }
  executeHttp(
    request: Request,
    response: Response<ResponseSchemaT, Record<string, any>>
  ): Promise<Response<ResponseSchemaT, Record<string, any>>> {
    throw new Error('Method not implemented.')
  }
}
