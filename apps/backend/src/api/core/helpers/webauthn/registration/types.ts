import { Passkey } from 'api/core/entities/passkey/model'
import { User } from 'api/core/entities/user/model'

export interface IWebAuthnRegistration {
  generateOptions(input: WebAuthnRegistrationGenerateOptionsInput): Promise<string>
  complete(input: WebAuthnRegistrationCompleteInput): Promise<WebAuthnRegistrationCompleteResult>
}

export type WebAuthnRegistrationGenerateOptionsInput = {
  user: User
  device?: string
}

export type WebAuthnRegistrationCompleteInput = {
  user: User
  registrationResponseJSON: string
}
export type WebAuthnRegistrationCompleteResult = { passkey: Passkey } | false
