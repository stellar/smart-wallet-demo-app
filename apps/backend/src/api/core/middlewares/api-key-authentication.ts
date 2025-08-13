import { NextFunction, Request, Response } from 'express'

import { getValueFromEnv, isLocalDeployStage, isTestEnv } from 'config/env-utils'
import { logger } from 'config/logger'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'

export async function apiKeyAuthentication(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const apiKeyHeader = req.headers['x-api-key']
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader
    if (!apiKey) {
      throw new UnauthorizedException('X-API-Key is missing')
    }

    if (isTestEnv() || isLocalDeployStage()) {
      // In test or local environments, we can skip API key validation
      // and directly assume it's valid for testing purposes.
      // This is not recommended for production use.
      return next()
    } else {
      // In production, we need to verify the API key signature
      // and ensure it is valid.
      const validApiKeys = getValueFromEnv('VALID_X_API_KEYS').split(',')
      if (!validApiKeys.includes(apiKey)) {
        throw new UnauthorizedException('Invalid API key')
      }
    }

    return next()
  } catch (error) {
    logger.error(error)
    throw new UnauthorizedException('Invalid API key')
  }
}
