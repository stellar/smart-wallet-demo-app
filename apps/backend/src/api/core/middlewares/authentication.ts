import { NextFunction, Request, Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'

import { isLocalDeployStage, isTestEnv } from 'config/env-utils'
import { logger } from 'config/logger'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { decodeToken, verifyToken } from 'interfaces/jwt'

export async function authentication(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authorization = req.headers.authorization
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing')
    }

    const token = authorization.replace('Bearer ', '')
    let data: JwtPayload

    if (isTestEnv() || isLocalDeployStage()) {
      // In test or local environments, we can skip token validation
      // and directly assume it's valid for testing purposes.
      // This is not recommended for production use.
      data = decodeToken(token)
    } else {
      // In production, we need to verify the token signature
      // and ensure it contains the necessary user information.
      data = verifyToken(token)
    }

    req.userData = {
      userId: data.userId,
      email: data.email,
    }
    return next()
  } catch (error) {
    logger.error(error)
    throw new UnauthorizedException('Invalid token')
  }
}
