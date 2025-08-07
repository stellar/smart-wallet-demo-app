import {
  AuthenticationExtensionsClientInputs,
  AuthenticatorTransportFuture,
  Base64URLString,
} from '@simplewebauthn/server'

import { Passkey } from 'api/core/entities/passkey/model'
import { User } from 'api/core/entities/user/model'
import { WebauthnChallengeStoreState } from 'interfaces/webauthn-challenge/types'

export interface IWebAuthnAuthentication {
  generateOptions(input: WebAuthnAuthenticationGenerateOptionsInput): Promise<string>
  complete(input: WebAuthnAuthenticationCompleteInput): Promise<WebAuthnAuthenticationCompleteResult>
}

type AuthenticationHandleType = 'raw' | 'standard'

export type WebAuthnAuthenticationOptions = {
  rpID: string
  allowCredentials?: {
    id: Base64URLString
    transports?: AuthenticatorTransportFuture[]
  }[]
  challenge?: string | Uint8Array
  timeout?: number
  userVerification?: 'required' | 'preferred' | 'discouraged'
  extensions?: AuthenticationExtensionsClientInputs
}

export type WebAuthnAuthenticationGenerateOptionsInput = {
  type: AuthenticationHandleType
  user: User
  customChallenge?: string | Uint8Array<ArrayBufferLike>
  customMetadata?: WebauthnChallengeStoreState['metadata']
}

export type WebAuthnAuthenticationCompleteInput = {
  type: AuthenticationHandleType
  user: User
  authenticationResponseJSON: string
}
export type WebAuthnAuthenticationCompleteResult =
  | {
      passkey: Passkey
      clientDataJSON: Buffer
      authenticatorData: Buffer
      compactSignature: Buffer
      customMetadata?: WebauthnChallengeStoreState['metadata']
    }
  | false
