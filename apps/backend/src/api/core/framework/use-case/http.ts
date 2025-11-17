import { Request, Response } from 'api/core/routes'

import { BaseResponseSchema, IUseCaseBase } from './base'

export interface IUseCaseHttp<UseCaseResponse extends BaseResponseSchema = BaseResponseSchema>
  extends IUseCaseBase<BaseResponseSchema> {
  /**
   * Connect the handle method with http layer
   *
   * We usually call this method in the routes.ts files
   *
   * @param request
   * @param response
   */
  executeHttp(request: Request, response: Response<UseCaseResponse>): Promise<Response<UseCaseResponse>>
}
