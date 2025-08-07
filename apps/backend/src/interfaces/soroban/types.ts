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

export type SimulateContractOperation = {
  contractId: string
  method: string
  args: xdr.ScVal[]
  signers?: ContractSigner[]
}

export type SimulationResult = {
  tx: Transaction
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse
}

export type GenerateWebAuthnChallenge = {
  contractId: string
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse
  signer: Pick<ContractSigner, 'addressId'>
}

export type SignAuthEntries = {
  contractId: string
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse
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
  signAuthEntries({ contractId, tx, simulationResponse, signers }: SignAuthEntries): Promise<Transaction>
  generateWebAuthnChallenge({ contractId, simulationResponse, signer }: GenerateWebAuthnChallenge): Promise<string>
  simulateContractOperation({ contractId, method, args, signers }: SimulateContractOperation): Promise<SimulationResult>
  simulateTransaction(tx: Transaction): Promise<rpc.Api.SimulateTransactionSuccessResponse>
  signTransactionWithSourceAccount(
    tx: Transaction | FeeBumpTransaction | string
  ): Promise<Transaction | FeeBumpTransaction>
  sendTransaction(tx: Transaction | FeeBumpTransaction | string): Promise<rpc.Api.GetSuccessfulTransactionResponse>
}
