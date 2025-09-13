import { createHash } from 'crypto'

import { compare, hash } from 'bcryptjs'

interface CryptoData {
  data: string
  strength?: number
}

async function encrypt({ data, strength = 8 }: CryptoData): Promise<string> {
  return hash(data, strength)
}

function sha256Hash(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Canonicalizes input parameters for consistent deterministic generation.
 * Normalizes email and wallet addresses and uses safe separator.
 *
 * @param email - User's email address
 * @param wallet - User's wallet address
 * @param sessionId - User's session ID
 * @param timestamp - Timestamp to use as salt (optional)
 * @returns Canonicalized input string
 */
function canonicalize(email: string, wallet: string, sessionId: string, timestamp?: number | string): string {
  return `${email.toLowerCase().trim()}|${wallet.toLowerCase().trim()}|${sessionId}|${timestamp || Date.now()}`
}

/**
 * Generates a deterministic random integer based on user email, wallet, session ID, and timestamp.
 * Uses the full SHA256 hash for better distribution and input normalization for consistency.
 * This function will always return the same number for the same inputs, making it deterministic.
 *
 * @param email - User's email address
 * @param wallet - User's wallet address
 * @param sessionId - User's session ID
 * @param timestamp - Current timestamp to use as salt (optional, defaults to current time)
 * @param max - Maximum value for the random number (defaults to 100000)
 * @returns A deterministic random integer between 0 and max
 */
function deterministicRandom(
  email: string,
  wallet: string,
  sessionId: string,
  timestamp?: number | string,
  max: number = 100000
): number {
  const input = canonicalize(email, wallet, sessionId, timestamp)
  const hash = createHash('sha256').update(input).digest() // Buffer
  const big = BigInt('0x' + hash.toString('hex'))
  return Number(big % BigInt(max + 1)) // range: 0 .. max
}

export { encrypt, compare, sha256Hash, canonicalize, deterministicRandom }
