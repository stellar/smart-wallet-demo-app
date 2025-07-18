import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser'

export interface IWebAuthnService {
  createPasskey: (input: WebAuthnCreatePasskeyInput) => Promise<WebAuthnCreatePasskeyResult>
  authenticateWithPasskey: (
    input: WebAuthnAuthenticateWithPasskeyInput
  ) => Promise<WebAuthnAuthenticateWithPasskeyResult>
}

export type WebAuthnCreatePasskeyInput = {
  optionsJSON: PublicKeyCredentialCreationOptionsJSON
}
export type WebAuthnCreatePasskeyResult = {
  rawResponse: RegistrationResponseJSON
  credentialId: string
}

export type WebAuthnAuthenticateWithPasskeyInput = {
  optionsJSON: PublicKeyCredentialRequestOptionsJSON
}
export type WebAuthnAuthenticateWithPasskeyResult = {
  rawResponse: AuthenticationResponseJSON
  clientDataJSON: Base64URLString
  authenticatorData: Base64URLString
  signatureDER: Buffer<ArrayBufferLike>
}
