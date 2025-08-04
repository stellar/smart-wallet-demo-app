import { FeeBumpTransaction, rpc, Transaction, xdr } from '@stellar/stellar-sdk'

import {
  AuthEntryMethods,
  AuthorizeEntryWithKeypairInput,
  AuthorizeEntryWithWebAuthnInput,
} from './helpers/auth-entry-signer/types'

export type ContractSigner = {
  addressId: string
  methodOptions:
    | {
        method: Extract<AuthEntryMethods, 'webauthn'>
        options: AuthorizeEntryWithWebAuthnInput['webAuthnOptions']
      }
    | {
        method: Extract<AuthEntryMethods, 'keypair'>
        options: AuthorizeEntryWithKeypairInput['keypairOptions']
      }
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

export type GenerateWebAuthnChallengeFromContract = Omit<SimulateContract, 'signers'> & {
  signer: Pick<ContractSigner, 'addressId'>
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

export interface ISorobanService {
  signAuthEntry({ contractId, entry, signer }: SignAuthEntry): Promise<xdr.SorobanAuthorizationEntry>
  signAuthEntries({ authEntries, signers, contractId, tx }: SignAuthEntries): Promise<Transaction>
  generateWebAuthnChallengeFromContract({
    contractId,
    method,
    args,
    signer,
  }: GenerateWebAuthnChallengeFromContract): Promise<string>
  simulateContract({ contractId, method, args, signers }: SimulateContract): Promise<SimulationResult>
  callContract({ tx, simulationResponse }: CallContract): Promise<rpc.Api.GetSuccessfulTransactionResponse>
  sendTransaction(tx: Transaction | FeeBumpTransaction | string): Promise<rpc.Api.GetSuccessfulTransactionResponse>
}
