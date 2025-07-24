import crypto from 'crypto'

import * as jose from 'jose'

import { Keypair, StrKey } from '@stellar/stellar-sdk'

import { getValueFromEnv } from 'config/env-utils'

import { TokenPayload } from './types'

const SECRET_KEY = getValueFromEnv('JWT_SECRET_KEY_WALLET_BACKEND')
const AUDIENCE = getValueFromEnv(
  'STELLAR_WALLET_BACKEND_URL',
  'https://wallet-backend-testnet-21ac687b8418.herokuapp.com'
)
const EXPIRES_IN = '10s' // As per wallet-backend requirements, expires in less than 15 seconds
const ALGORITHM = 'EdDSA' // Algorithm used for signing the JWT

/**
 * Generate a JWT token as per wallet-backend requirements: https://github.com/stellar/wallet-backend?tab=readme-ov-file#authentication
 *
 * @param {TokenPayload} payload - The payload to include in the JWT.
 * @returns {string} - The generated JWT token.
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  payload.bodyHash = crypto.createHash('sha256').update(payload.bodyHash).digest('hex')

  const keypair = Keypair.fromSecret(SECRET_KEY)

  // Decode StrKey to raw bytes
  const rawPublicKey = StrKey.decodeEd25519PublicKey(keypair.publicKey()) // Uint8Array(32)
  const rawSecretKey = StrKey.decodeEd25519SecretSeed(keypair.secret()) // Uint8Array(32)

  // Construct the key in format JWK
  const jwk = {
    kty: 'OKP',
    crv: 'Ed25519',
    x: Buffer.from(rawPublicKey).toString('base64url'),
    d: Buffer.from(rawSecretKey).toString('base64url'),
  }

  // Import the JWK
  const privateKey = await jose.importJWK(jwk, ALGORITHM)

  const token = await new jose.SignJWT({ ...payload, aud: AUDIENCE })
    .setProtectedHeader({ alg: ALGORITHM, typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(privateKey)

  return token
}
