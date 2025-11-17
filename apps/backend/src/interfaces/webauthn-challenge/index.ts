import crypto from 'crypto'

import { SingletonBase } from 'api/core/framework/singleton/interface'

import { IWebauthnChallengeService, WebauthnChallengeStoreState } from './types'

// TODO: Use redis
export class WebAuthnChallengeService extends SingletonBase implements IWebauthnChallengeService {
  private store: Map<string, WebauthnChallengeStoreState>

  constructor() {
    super()
    this.store = new Map()
  }

  createChallenge(): string {
    const challenge = crypto.randomBytes(32).toString('base64url')
    return challenge
  }

  storeChallenge(identifier: string, challenge: string, ttlInSeconds?: number): void {
    const ttlInMinutes = ttlInSeconds ? ttlInSeconds / 60 : 5
    const expiresAt = Date.now() + ttlInMinutes * 60 * 1000
    this.store.set(identifier, { challenge, expiresAt })
  }

  setMetadata(identifier: string, metadata: WebauthnChallengeStoreState['metadata']): void {
    const record = this.getChallenge(identifier)

    if (!record) throw Error(`${this.constructor.name}.setMetadata | Missing record for ${identifier}`)

    this.store.set(identifier, { ...record, metadata })
  }

  getChallenge(identifier: string): WebauthnChallengeStoreState | null {
    const record = this.store.get(identifier)

    if (!record) return null

    if (record.expiresAt < Date.now()) {
      this.store.delete(identifier)
      return null
    }

    return record
  }

  deleteChallenge(identifier: string): void {
    this.store.delete(identifier)
  }
}
