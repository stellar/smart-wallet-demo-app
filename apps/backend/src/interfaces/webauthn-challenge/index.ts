import crypto from 'crypto'
import { IWebauthnChallengeService, WebauthnChallengeStoreState } from './types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export class WebAuthnChallengeService extends SingletonBase implements IWebauthnChallengeService {
  private store: Map<string, WebauthnChallengeStoreState>

  constructor() {
    super()
    this.store = new Map()
  }

  createChallenge(identifier: string): string {
    const challenge = crypto.randomBytes(32).toString('base64url')
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 min TTL
    this.store.set(identifier, { challenge, expiresAt })
    return challenge
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
