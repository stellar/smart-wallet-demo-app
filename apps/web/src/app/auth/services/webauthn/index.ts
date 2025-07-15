import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import base64url from 'base64url'
import {
  WebAuthnAuthenticateWithPasskeyInput,
  WebAuthnAuthenticateWithPasskeyResult,
  WebAuthnCreatePasskeyInput,
  WebAuthnCreatePasskeyResult,
  IWebAuthnService,
} from './types'
import logger from 'src/app/core/services/logger'

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

  async createPasskey(input: WebAuthnCreatePasskeyInput): Promise<WebAuthnCreatePasskeyResult> {
    try {
      logger.debug(`${this.constructor.name}.createPasskey | Input`, input)

      const rawResponse = await this.webAuthnClient.startRegistration({ optionsJSON: input.optionsJSON })

      const result = {
        rawResponse,
        credentialId: rawResponse.id,
      }

      logger.debug(`${this.constructor.name}.createPasskey | Result`, result)
      return result
    } catch (error) {
      logger.error(`${this.constructor.name}.createPasskey | Failed`, error)
      throw new Error('Failed to create passkey')
    }
  }

  async authenticateWithPasskey(
    input: WebAuthnAuthenticateWithPasskeyInput
  ): Promise<WebAuthnAuthenticateWithPasskeyResult> {
    try {
      logger.debug(`${this.constructor.name}.authenticateWithPasskey | Input`, input)

      const rawResponse = await startAuthentication({ optionsJSON: input.optionsJSON })

      const result = {
        rawResponse,
        clientDataJSON: rawResponse.response.clientDataJSON,
        authenticatorData: rawResponse.response.authenticatorData,
        signatureDER: base64url.toBuffer(rawResponse.response.signature),
      }

      logger.debug(`${this.constructor.name}.authenticateWithPasskey | Result`, result)
      return result
    } catch (error) {
      logger.error(`${this.constructor.name}.authenticateWithPasskey | Failed`, error)
      throw new Error('Failed to authenticate with passkey')
    }
  }
}

const webauthnService = new WebAuthnService()

export { webauthnService }
