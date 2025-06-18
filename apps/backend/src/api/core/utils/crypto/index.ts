import { compare, hash } from 'bcryptjs'

interface CryptoData {
  data: string
  strength?: number
}

async function encrypt({ data, strength = 8 }: CryptoData): Promise<string> {
  return hash(data, strength)
}

export { encrypt, compare }
