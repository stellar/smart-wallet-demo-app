import { faker } from '@faker-js/faker'

import { randomContractAddress } from 'test-utils'

import { Proof } from './model'

interface ProofFactoryArgs {
  receiverAddress?: string
  contractAddress?: string
  index?: number
  receiverAmount?: string
  proofs?: string[]
  createdAt?: Date
}

export const proofFactory = ({
  receiverAddress,
  contractAddress,
  index,
  receiverAmount,
  proofs,
  createdAt,
}: ProofFactoryArgs = {}): Proof => {
  const proof = new Proof()

  proof.receiverAddress = receiverAddress ?? randomContractAddress()
  proof.contractAddress = contractAddress ?? randomContractAddress()
  proof.index = index ?? faker.number.int({ min: 0, max: 1000 })
  proof.receiverAmount = receiverAmount ?? faker.number.int({ min: 1000000, max: 10000000 }).toString()
  proof.proofs = proofs ?? [faker.string.hexadecimal({ length: 64, prefix: '' })]
  proof.createdAt = createdAt ?? faker.date.past()

  return proof
}
