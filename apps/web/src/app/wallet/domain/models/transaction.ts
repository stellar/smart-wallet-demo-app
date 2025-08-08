export interface Transaction {
  hash: string
  type: string
  vendor: string
  amount: number
  asset: string
  date: string
  fromAddress?: string
  toAddress?: string
  sendOrReceive?: 'send' | 'receive'
}
