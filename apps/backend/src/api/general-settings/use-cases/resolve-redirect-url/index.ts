import { Request, Response } from 'express'

import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { logger } from 'config/logger'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class ResolveRedirectUrl extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const finalUrl = await this.resolveRedirectUrl(validatedData.url)

    return {
      data: {
        final_url: finalUrl,
      },
      message: 'Redirect URL resolved successfully',
    }
  }

  private async resolveRedirectUrl(url: string): Promise<string> {
    try {
      const parsed = new URL(url)
      const redirectServices = ['qrco.de', 'bit.ly', 'tinyurl.com', 'short.link']

      if (redirectServices.some(service => parsed.hostname.includes(service))) {
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SmartWallet/1.0)',
          },
        })
        return response.url
      }

      return url
    } catch (error) {
      logger.warn(`ResolveRedirectUrl.resolveRedirectUrl | Failed to resolve redirect for ${url}`, error as string)
      // If redirect resolution fails, return the original URL
      return url
    }
  }
}

export { endpoint }
