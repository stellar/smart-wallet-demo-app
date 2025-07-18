export type WebauthnChallengeStoreState = {
  challenge: string
  expiresAt: number
  metadata?: { userId: string; label: string }
}

export interface IWebauthnChallengeService {
  createChallenge(identifier: string): string
  storeChallenge(identifier: string, challenge: string): void
  setMetadata(identifier: string, metadata: WebauthnChallengeStoreState['metadata']): void
  getChallenge(identifier: string): WebauthnChallengeStoreState | null
  deleteChallenge(identifier: string): void
}
