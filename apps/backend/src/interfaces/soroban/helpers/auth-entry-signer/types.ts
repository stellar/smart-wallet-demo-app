import { Base64URLString } from '@simplewebauthn/server'
import { xdr } from '@stellar/stellar-sdk'

type AuthEntryOptions = {
  unsignedEntry: xdr.SorobanAuthorizationEntry
  validUntilLedgerSeq: number
  networkPassphrase: string
}

export type AuthEntryMethods = 'keypair' | 'webauthn'

export type GenerateWebAuthnChallengeInput = {
  entryOptions: AuthEntryOptions
}

export type AuthorizeEntryWithWebAuthnInput = {
  webAuthnOptions: {
    credentialId: string
    clientDataJSON: Base64URLString
    authenticatorData: Base64URLString
    compactSignature: Buffer
  }
  entryOptions: AuthEntryOptions
}
export type AuthorizeEntryWithKeypairInput = {
  keypairOptions: {
    secret: string
  }
  entryOptions: AuthEntryOptions
}

export interface IAuthEntrySignerHelper {
  generateWebAuthnChallenge(input: GenerateWebAuthnChallengeInput): Promise<string>
  authorizeEntryWithWebAuthn(input: AuthorizeEntryWithWebAuthnInput): Promise<xdr.SorobanAuthorizationEntry>
  authorizeEntryWithKeypair(input: AuthorizeEntryWithKeypairInput): Promise<xdr.SorobanAuthorizationEntry>
}
