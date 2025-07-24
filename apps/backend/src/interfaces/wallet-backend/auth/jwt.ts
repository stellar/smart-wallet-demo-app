import crypto from 'crypto'

import { SignJWT } from 'jose'

import { Keypair, StrKey } from '@stellar/stellar-sdk'

import { getValueFromEnv } from 'config/env-utils'

import { TokenPayload } from './types'

const SECRET_KEY = getValueFromEnv('JWT_SECRET_KEY_WALLET_BACKEND')
const PUBLIC_KEY = Keypair.fromSecret(SECRET_KEY).publicKey() // Public key used as subject in JWT
const AUDIENCE = getValueFromEnv(
  'STELLAR_WALLET_BACKEND_URL',
  'https://wallet-backend-testnet-21ac687b8418.herokuapp.com'
)
  .replace('https://', '')
  .replace('http://', '') // Remove protocol from URL to match wallet-backend requirements

/**
 * Generate a JWT token as per wallet-backend requirements: https://github.com/stellar/wallet-backend?tab=readme-ov-file#authentication
 *
 * @param {TokenPayload} payload - The payload to include in the JWT.
 * @returns {string} - The generated JWT token.
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  payload.bodyHash = hashBody(payload.bodyHash)

  // Decode StrKey to raw bytes
  const rawSecretKey = StrKey.decodeEd25519SecretSeed(SECRET_KEY) // Uint8Array(32)
  const privateKey = Buffer.from(rawSecretKey)

  const now = Math.floor(Date.now() / 1000)

  const claims = {
    ...payload,
    iat: now, // Issued at time
    exp: now + 5, // Set expiration time to 5 seconds from now
    sub: PUBLIC_KEY, // Use public key as subject
    aud: [AUDIENCE], // Audience is the wallet backend URL
  }

  // Construct the key in format JWK
  const jwk = {
    kty: 'OKP',
    crv: 'Ed25519',
    d: privateKey.toString('base64url'),
    x: Buffer.from(Keypair.fromSecret(SECRET_KEY).rawPublicKey()).toString('base64url'),
  }

  const token = await new SignJWT(claims).setProtectedHeader({ alg: 'EdDSA' }).sign(jwk)

  return token
}

export function hashBody(body: string): string {
  return crypto.createHash('sha256').update(Buffer.from(body)).digest('hex')
}
