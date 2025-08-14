import { StrKey } from '@stellar/stellar-sdk'

export function randomContractAddress(): string {
  const randomBytes = Buffer.alloc(32)
  for (let i = 0; i < 32; i++) {
    randomBytes[i] = Math.floor(Math.random() * 256)
  }
  return StrKey.encodeContract(randomBytes)
}
