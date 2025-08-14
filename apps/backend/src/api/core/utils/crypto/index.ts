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

export { encrypt, compare, sha256Hash }
