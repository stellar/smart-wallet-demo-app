import { rpc, Transaction } from '@stellar/stellar-sdk'

type PasskeyRegistrationMetadata = {
  type: 'passkey'
  userId: string
  label: string
}

type SorobanMetadata = {
  type: 'soroban'
  tx: Transaction
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse
}

export type WebauthnChallengeStoreState = {
  challenge: string
  expiresAt: number
  metadata?: PasskeyRegistrationMetadata | SorobanMetadata
}

export interface IWebauthnChallengeService {
  createChallenge(identifier: string): string
  storeChallenge(identifier: string, challenge: string | Uint8Array): void
  setMetadata(identifier: string, metadata: WebauthnChallengeStoreState['metadata']): void
  getChallenge(identifier: string): WebauthnChallengeStoreState | null
  deleteChallenge(identifier: string): void
}
