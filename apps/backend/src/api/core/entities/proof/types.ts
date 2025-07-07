import { Proof } from './model'

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

export interface ProofRepositoryType {
  findByAddress(receiverAddress: string): Promise<Proof | null>
}
