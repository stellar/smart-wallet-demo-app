import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

import logger from 'src/app/core/services/logger'

import {
  WebAuthnAuthenticateWithPasskeyInput,
  WebAuthnAuthenticateWithPasskeyResult,
  WebAuthnCreatePasskeyInput,
  WebAuthnCreatePasskeyResult,
  IWebAuthnService,
} from './types'

export class WebAuthnService implements IWebAuthnService {
  private webAuthnClient: {
    startRegistration: typeof startRegistration
    startAuthentication: typeof startAuthentication
  }

  constructor(webAuthn?: {
    startRegistration: typeof startRegistration
    startAuthentication: typeof startAuthentication
  }) {
    this.webAuthnClient = webAuthn || { startRegistration, startAuthentication }
  }

  /**
   * Initiates the passkey registration flow using WebAuthn.
   * The {@link WebAuthnCreatePasskeyInput} is used to construct the `PublicKeyCredentialCreationOptions` object
   * which will be passed to the `startRegistration` method.
   *
   * @param input The options which will be used to construct the `PublicKeyCredentialCreationOptions` object.
   *
   * @returns A promise that resolves with the raw response from the registration flow and the credentialId.
   * If the registration fails, the promise will be rejected with an error.
   */
  async createPasskey(input: WebAuthnCreatePasskeyInput): Promise<WebAuthnCreatePasskeyResult> {
    logger.debug(`${this.constructor.name}.createPasskey | Input`, input)

    const rawResponse = await this.webAuthnClient.startRegistration({ optionsJSON: input.optionsJSON })

    const result = {
      rawResponse,
      credentialId: rawResponse.id,
    }

    logger.debug(`${this.constructor.name}.createPasskey | Result`, result)
    return result
  }

  /**
   * Authenticates a user using a WebAuthn passkey.
   * The {@link WebAuthnAuthenticateWithPasskeyInput} provides the necessary options for the authentication process.
   *
   * @param input The options which will be used to construct the `PublicKeyCredentialRequestOptions` object.
   *
   * @returns A promise that resolves with the raw response and authentication details.
   * If the authentication fails, the promise will be rejected with an error.
   */
  async authenticateWithPasskey(
    input: WebAuthnAuthenticateWithPasskeyInput
  ): Promise<WebAuthnAuthenticateWithPasskeyResult> {
    logger.debug(`${this.constructor.name}.authenticateWithPasskey | Input`, input)

    const rawResponse = await startAuthentication({ optionsJSON: input.optionsJSON })

    const result = {
      rawResponse,
      clientDataJSON: rawResponse.response.clientDataJSON,
      authenticatorData: rawResponse.response.authenticatorData,
      signature: rawResponse.response.signature,
    }

    logger.debug(`${this.constructor.name}.authenticateWithPasskey | Result`, result)
    return result
  }
}

const webauthnService = new WebAuthnService()

export { webauthnService }
