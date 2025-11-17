export interface ProofRecord {
  id: string
  contractAddress: string
  index: number
  receiver: {
    address: string
    amount: number
  }
  proofs: string[]
  createdAt: Date
}
