import { Proof } from './model'

export interface ProofRepositoryType {
  findByAddressAndContract(receiverAddress: string, contractAddress: string): Promise<Proof | null>
  saveProofs(proofs: Proof[]): Promise<Proof[]>
}
