// Type definitions
export type StellarConfig = {
  NETWORK_PASSPHRASE: string
  HORIZON_URL: string
  SOROBAN_RPC_URL: string
  MAX_FEE: string
  SOURCE_ACCOUNT: SignerKeypair
  TOKEN_CONTRACT: TokenContractConfig
  AIRDROP_CONTRACT_ADDRESS: string
  GIFT_AIRDROP_CONTRACT_ADDRESS: string
}

export type ProjectConfig = {
  ID: string
  TITLE: string
  DOMAIN: string
}

export type TokenContractConfig = {
  NATIVE: string
}

export type SignerKeypair = {
  PRIVATE_KEY: string
  PUBLIC_KEY: string
}
