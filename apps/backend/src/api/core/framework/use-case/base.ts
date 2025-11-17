import { Request } from 'express'
import { z, ZodError, ZodType } from 'zod'

import { ZodValidationException } from 'errors/exceptions/zod-validation'

type ResponseSchema<T extends z.ZodTypeAny> = z.ZodObject<{
  message: z.ZodString
  data: T
}>

export function createResponseSchema<T extends z.ZodTypeAny>(dataSchema: T): ResponseSchema<T> {
  return z.object({
    message: z.string(),
    data: dataSchema,
  })
}

export const BaseResponseSchema = z.union([createResponseSchema(z.any()), z.string(), z.object({})])
export type BaseResponseSchema = z.infer<typeof BaseResponseSchema>

export interface IUseCaseBase<Response extends BaseResponseSchema = BaseResponseSchema> {
  handle(...params: unknown[]): Promise<Response>
}

export abstract class UseCaseBase<UseCaseResponse extends BaseResponseSchema = BaseResponseSchema>
  implements IUseCaseBase
{
  /**
   * This param is the a optional requestId which can be set using setRequestId method
   * @property requestId
   */
  protected requestId?: string

  /**
   * This method is where we should implement our business logic of the use case
   * @param params
   */
  abstract handle(...params: unknown[]): Promise<UseCaseResponse>

  /**
   * Validated a payload using a zod schema
   * This method throw a ZodValidationException if the payload have validation error.
   *
   * More information about zod in: https://zod.dev/
   *
   * @param payload
   * @param schema
   * @protected
   * @throws ZodValidationException
   */
  protected validate<T extends ZodType>(payload: unknown, schema: T): z.infer<typeof schema> {
    const request: { success: boolean; error?: ZodError; data?: typeof payload } = schema.safeParse(payload)
    if (!request.success && request.error instanceof ZodError) {
      throw new ZodValidationException(request.error)
    }
    return request.data as z.infer<typeof schema>
  }

  static init<T, Args extends unknown[]>(this: new (...args: Args) => T, ...args: Args): T {
    return new this(...args)
  }

  /**
   * Set the use case request id
   *
   * We should call this method on the use case executeHttp method if use case implements IUseCaseHttp
   *
   * @param request
   */
  protected setRequestId(request?: Request): void {
    if (!request) return

    this.requestId = request?.requestId
  }

  protected overrideRequestId(id: string): void {
    this.requestId = id
  }
}
