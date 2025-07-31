import { StrKey } from '@stellar/stellar-sdk'

/**
 * Shortens a Stellar wallet address to 8 characters or less, e.g. "G...1234"
 * @param fullAddress - The full Stellar wallet address
 * @param options.onlyValidAddress - If true, only return a shortened version if the fullAddress is a valid Stellar address
 * @returns A shortened version of the Stellar wallet address
 */
export const createShortStellarAddress = (fullAddress: string, options?: { onlyValidAddress?: boolean }): string => {
  if (options?.onlyValidAddress && !isValidStellarAddress(fullAddress)) return fullAddress
  if (fullAddress.length <= 8) return fullAddress
  return `${fullAddress.slice(0, 4)}...${fullAddress.slice(-4)}`
}

/**
 * Checks if the given string is a valid Stellar address (either a public key or contract)
 * @param text - The string to check
 * @returns True if the string is a valid Stellar address, false otherwise
 */
export const isValidStellarAddress = (text: string): boolean => {
  try {
    return StrKey.isValidEd25519PublicKey(text) || StrKey.isValidContract(text)
  } catch {
    return false
  }
}
