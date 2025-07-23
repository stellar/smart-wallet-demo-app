import crypto from 'crypto'

import * as jwt from 'jsonwebtoken'

import { getValueFromEnv } from 'config/env-utils'

import { TokenPayload } from './types'

const SECRET_KEY = getValueFromEnv('JWT_SECRET_KEY_WALLET_BACKEND')
const EXPIRES_IN = '10s' // As per wallet-backend requirements, expires in less than 15 seconds
const AUDIENCE = getValueFromEnv('SERVER_ADDRESS', 'http://localhost:8000')

/**
 * Generate a JWT token as per wallet-backend requirements: https://github.com/stellar/wallet-backend?tab=readme-ov-file#authentication
 *
 * @param {TokenPayload} tokenPayload - The payload to include in the JWT.
 * @returns {string} - The generated JWT token.
 */
export function generateToken(payload: TokenPayload): string {
  payload.bodyHash = crypto.createHash('sha256').update(payload.bodyHash).digest('hex')
  return jwt.sign({ ...payload, aud: AUDIENCE }, SECRET_KEY, { expiresIn: EXPIRES_IN })
}
