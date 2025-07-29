import { Base64URLString } from '@simplewebauthn/server'

import { Passkey } from 'api/core/entities/passkey/model'
import { User } from 'api/core/entities/user/model'

export interface IWebAuthnAuthentication {
  generateOptions(input: WebAuthnAuthenticationGenerateOptionsInput): Promise<string>
  complete(input: WebAuthnAuthenticationCompleteInput): Promise<WebAuthnAuthenticationCompleteResult>
}

export type WebAuthnAuthenticationGenerateOptionsInput = {
  user: User
  customChallenge?: string | Uint8Array<ArrayBufferLike>
}

export type WebAuthnAuthenticationCompleteInput = {
  user: User
  authenticationResponseJSON: string
}
export type WebAuthnAuthenticationCompleteResult =
  | {
      passkey: Passkey
      clientDataJSON: Base64URLString
      authenticatorData: Base64URLString
      compactSignature: Buffer
    }
  | false
