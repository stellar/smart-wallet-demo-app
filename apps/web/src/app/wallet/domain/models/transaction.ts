export interface Transaction {
  hash: string
  type: string
  vendor?: string
  amount: number
  asset: string
  date: string
  token?: {
    name: string
    description: string
    symbol: string
    contract_address: string
    image_url: string
    session_id: string
    resource: string
  }
  product?: { product_id: string; code: string; name: string; description: string }[]
  fromAddress?: string
  toAddress?: string
  sendOrReceive?: 'send' | 'receive'
}

export enum CustomTxTypes {
  AIRDROP_CLAIM = 'airdrop_claim',
  DONATION = 'donation',
  SWAG = 'swag',
  NFT = 'nft',
  BUY_PRODUCT = 'buy_product',
  NFT_CLAIM = 'nft_claim',
}
