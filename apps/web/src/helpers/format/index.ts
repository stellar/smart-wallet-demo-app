/**
 * Creates a shortened version of a wallet address for display purposes
 * @param fullAddress - The complete wallet address
 * @returns Shortened address in format "XXXX...YYYY" or the original if length <= 8
 */
export const createShortWalletAddress = (fullAddress: string): string => {
  if (fullAddress.length <= 8) return fullAddress
  return `${fullAddress.slice(0, 4)}...${fullAddress.slice(-4)}`
}
