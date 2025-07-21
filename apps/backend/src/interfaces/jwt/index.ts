import * as jwt from 'jsonwebtoken'

import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'

const SECRET_KEY = getValueFromEnv('JWT_SECRET_KEY')
const EXPIRES_IN = getValueFromEnv('JWT_EXPIRATION', '1h') as jwt.SignOptions['expiresIn'] // Default to 1 hour if not set

/**
 * Generate a JWT token with the given userId and roles.
 * @param userId The user ID to include in the token
 * @param roles The roles to include in the token
 * @returns The generated JWT token
 */
export function generateToken(userId: string, email: string): string {
  const payload = { userId, email }
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN })
}

/**
 * Verify a JWT token. This function will throw an UnauthorizedException if the token
 * is invalid or does not contain a userId and roles.
 * @param token The JWT token to verify
 * @returns The decoded payload if the token is valid
 * @throws UnauthorizedException if the token is invalid
 */
export function verifyToken(token: string): jwt.JwtPayload {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload
    if (!decoded || !decoded.userId || !decoded.email) {
      throw new UnauthorizedException('Invalid token')
    }
    return decoded
  } catch (error) {
    logger.error(error)
    throw new UnauthorizedException('Invalid token')
  }
}

/**
 * Decode a JWT token without verifying it. This is useful for extracting the payload
 * without validating the signature.
 * @param token The JWT token to decode
 * @returns The decoded payload or null if the token is invalid
 */
export function decodeToken(token: string): jwt.JwtPayload {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload
    if (!decoded || !decoded.userId || !decoded.email) {
      throw new UnauthorizedException('Invalid token')
    }
    return decoded
  } catch (error) {
    logger.error(error)
    throw new UnauthorizedException('Invalid token')
  }
}
