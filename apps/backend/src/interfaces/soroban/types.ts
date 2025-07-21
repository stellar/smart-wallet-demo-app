import { rpc, Transaction, xdr } from '@stellar/stellar-sdk'

export type ContractSigner = {
  addressId: string
  // method: AuthEntrySigner;
}

export type SimulateContract = {
  contractId: string
  method: string
  args: xdr.ScVal[]
  signers?: ContractSigner[]
}

export type SimulationResult = {
  tx: Transaction
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse
}

export type CallContract = {
  tx: Transaction
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse
}

export type SignAuthEntries = {
  contractId: string
  authEntries: xdr.SorobanAuthorizationEntry[]
  tx: Transaction
  signers: ContractSigner[]
}

export type SignAuthEntry = {
  contractId: string
  entry: xdr.SorobanAuthorizationEntry
  signer: ContractSigner
}

export type SorobanEntryAddress = {
  id: string
  type: xdr.ScAddressType // xdr.ScAddressType.scAddressTypeAccount() | xdr.ScAddressType.scAddressTypeContract();
  scAddress: xdr.ScAddress
}

export interface SorobanService {
  simulateContract({ contractId, method, args, signers }: SimulateContract): Promise<SimulationResult>
}
