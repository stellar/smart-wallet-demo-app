import {
  AuthenticatorAttestationResponseJSON,
  AuthenticatorTransportFuture,
  generateRegistrationOptions,
  RegistrationResponseJSON,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'
import base64url from 'base64url'

import { PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import PasskeyRepository from 'api/core/services/passkey'
import { getValueFromEnv } from 'config/env-utils'
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

import {
  IWebAuthnRegistration,
  WebAuthnRegistrationCompleteInput,
  WebAuthnRegistrationCompleteResult,
  WebAuthnRegistrationGenerateOptionsInput,
} from './types'

export default class WebAuthnRegistration extends SingletonBase implements IWebAuthnRegistration {
  private passkeyRepository: PasskeyRepositoryType
  private webauthnChallengeService: IWebauthnChallengeService

  constructor(passkeyRepository?: PasskeyRepositoryType, webauthnChallengeService?: IWebauthnChallengeService) {
    super()
    this.passkeyRepository = passkeyRepository || PasskeyRepository.getInstance()
    this.webauthnChallengeService = webauthnChallengeService || WebAuthnChallengeService.getInstance()
  }

  async generateOptions(input: WebAuthnRegistrationGenerateOptionsInput): Promise<string> {
    const { user, device } = input

    const relyingPartyName = getValueFromEnv('WEBAUTHN_RP_NAME')
    const relyingPartyId = new URL(getValueFromEnv('WEBAUTHN_RP_ORIGIN')).hostname

    const userIdentifier = user.email.toLowerCase().trim()
    const userDisplayName = `${relyingPartyName} | ${device || 'My Device'}`.trim()
    const challenge = this.webauthnChallengeService.createChallenge(userIdentifier)

    const options = await generateRegistrationOptions({
      rpName: relyingPartyName,
      rpID: relyingPartyId,
      userID: base64url.toBuffer(userIdentifier),
      userName: userIdentifier,
      userDisplayName: userDisplayName,
      challenge: challenge,
      supportedAlgorithmIDs: [-7],
      attestationType: 'none',
      excludeCredentials: user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        transports: passkey.transports?.split(',') as AuthenticatorTransportFuture[] | undefined,
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
      timeout: 120000, // 2 minutes
    })

    this.webauthnChallengeService.storeChallenge(userIdentifier, options.challenge)
    this.webauthnChallengeService.setMetadata(userIdentifier, {
      type: 'passkey',
      label: userDisplayName,
      userId: options.user.id,
    })

    return JSON.stringify(options)
  }

  async complete(input: WebAuthnRegistrationCompleteInput): Promise<WebAuthnRegistrationCompleteResult> {
    const { user, registrationResponseJSON } = input

    const relyingPartyOrigin = getValueFromEnv('WEBAUTHN_RP_ORIGIN')
    const relyingPartyId = new URL(relyingPartyOrigin).hostname

    const userIdentifier = user.email.toLowerCase().trim()
    const getChallenge = this.webauthnChallengeService.getChallenge(userIdentifier)

    if (!getChallenge || !getChallenge.metadata)
      throw Error(`${this.constructor.name} | complete | Missing challenge information for ${userIdentifier}`)

    const registrationResponse = JSON.parse(registrationResponseJSON) as RegistrationResponseJSON
    const { registrationInfo } = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: getChallenge.challenge,
      expectedOrigin: relyingPartyOrigin,
      expectedRPID: relyingPartyId,
    })
    this.webauthnChallengeService.deleteChallenge(userIdentifier)

    if (!registrationInfo)
      throw Error(`${this.constructor.name} | complete | Missing registrationInfo for ${userIdentifier}`)

    const hexPublicKey = this.extractPublicKey(registrationResponse.response)
    if (!hexPublicKey) throw Error(`${this.constructor.name} | complete | Missing hexPublicKey for ${userIdentifier}`)

    const { userVerified, credential, credentialDeviceType, credentialBackedUp } = registrationInfo

    if (!userVerified) return false

    if (getChallenge.metadata.type !== 'passkey')
      throw Error(`${this.constructor.name} | complete | Invalid challenge type for ${userIdentifier}`)

    // Delete existing passkeys
    if (user.passkeys.length)
      await this.passkeyRepository.deletePasskeys(user.passkeys.map(passkey => passkey.credentialId))
    // Create new passkey
    const passkey = await this.passkeyRepository.createPasskey(
      {
        user,
        webauthnUserId: getChallenge.metadata.userId,
        label: getChallenge.metadata.label,
        credentialId: credential.id,
        credentialPublicKey: credential.publicKey,
        credentialHexPublicKey: hexPublicKey,
        counter: credential.counter,
        transports: credential.transports?.join(','),
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
      },
      true
    )

    return { passkey }
  }

  private extractPublicKey(response: AuthenticatorAttestationResponseJSON): string | null {
    const parsePublicKey = (publicKeyBytes: Uint8Array): string => {
      const publicKeyHex = Array.from(publicKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      return publicKeyHex
    }

    // Try to extract public key from different response formats

    // Method 1: Direct publicKey field
    if (response.publicKey) {
      const publicKeyBuffer = base64url.toBuffer(response.publicKey)
      // Check if it's already in the right format
      if (publicKeyBuffer.length === 65 && publicKeyBuffer[0] === 0x04) {
        return parsePublicKey(new Uint8Array(publicKeyBuffer))
      }
      // If it's DER encoded, extract the raw key
      if (publicKeyBuffer.length > 65) {
        for (let i = publicKeyBuffer.length - 65; i >= 0; i--) {
          if (publicKeyBuffer[i] === 0x04 && i + 65 <= publicKeyBuffer.length) {
            return parsePublicKey(new Uint8Array(publicKeyBuffer.slice(i, i + 65)))
          }
        }
      }
    }

    // Method 2: Parse from attestationObject
    if (response.attestationObject) {
      const attestationObject = base64url.toBuffer(response.attestationObject)

      // Search for COSE key structure
      // Looking for the x and y coordinates in CBOR format
      for (let i = 0; i < attestationObject.length - 70; i++) {
        if (
          attestationObject[i] === 0x21 && // -2 (x coordinate key)
          attestationObject[i + 1] === 0x58 && // byte string
          attestationObject[i + 2] === 0x20 && // length 32
          i + 35 < attestationObject.length &&
          attestationObject[i + 35] === 0x22 && // -3 (y coordinate key)
          attestationObject[i + 36] === 0x58 && // byte string
          attestationObject[i + 37] === 0x20
        ) {
          // length 32
          const x = attestationObject.slice(i + 3, i + 35)
          const y = attestationObject.slice(i + 38, i + 70)

          // Create uncompressed public key
          const publicKey = new Uint8Array(65)
          publicKey[0] = 0x04
          publicKey.set(x, 1)
          publicKey.set(y, 33)
          return parsePublicKey(publicKey)
        }
      }
    }

    // Method 3: Parse from authenticatorData if available
    if (response.authenticatorData) {
      const authData = base64url.toBuffer(response.authenticatorData)

      // Skip RP ID hash (32) + flags (1) + counter (4) = 37 bytes
      // Check if credential data is present (bit 6 of flags byte)
      if (authData.length > 37 && authData[32] & 0x40) {
        let offset = 37

        // Skip AAGUID (16 bytes)
        offset += 16

        // Get credential ID length (2 bytes, big-endian)
        if (offset + 2 <= authData.length) {
          const credIdLen = (authData[offset] << 8) | authData[offset + 1]
          offset += 2 + credIdLen

          // Now we should be at the public key in COSE format
          // Search for x and y coordinates
          for (let i = offset; i < authData.length - 70 && i < offset + 200; i++) {
            if (
              authData[i] === 0x21 &&
              authData[i + 1] === 0x58 &&
              authData[i + 2] === 0x20 &&
              i + 35 < authData.length &&
              authData[i + 35] === 0x22 &&
              authData[i + 36] === 0x58 &&
              authData[i + 37] === 0x20
            ) {
              const x = authData.slice(i + 3, i + 35)
              const y = authData.slice(i + 38, i + 70)

              const publicKey = new Uint8Array(65)
              publicKey[0] = 0x04
              publicKey.set(x, 1)
              publicKey.set(y, 33)
              return parsePublicKey(publicKey)
            }
          }
        }
      }
    }

    return null
  }
}
