import {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import base64url from 'base64url'

import { PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import PasskeyRepository from 'api/core/services/passkey'
import { getValueFromEnv } from 'config/env-utils'
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

import {
  IWebAuthnAuthentication,
  WebAuthnAuthenticationCompleteInput,
  WebAuthnAuthenticationCompleteResult,
  WebAuthnAuthenticationGenerateOptionsInput,
} from './types'

export default class WebAuthnAuthentication extends SingletonBase implements IWebAuthnAuthentication {
  private passkeyRepository: PasskeyRepositoryType
  private webauthnChallengeService: IWebauthnChallengeService

  constructor(passkeyRepository?: PasskeyRepositoryType, webauthnChallengeService?: IWebauthnChallengeService) {
    super()
    this.passkeyRepository = passkeyRepository || PasskeyRepository.getInstance()
    this.webauthnChallengeService = webauthnChallengeService || WebAuthnChallengeService.getInstance()
  }

  async generateOptions(input: WebAuthnAuthenticationGenerateOptionsInput): Promise<string> {
    const { user, customChallenge } = input

    const relyingPartyId = new URL(getValueFromEnv('WEBAUTHN_RP_ORIGIN')).hostname

    const userIdentifier = user.email.toLowerCase().trim()
    const challenge = customChallenge ?? this.webauthnChallengeService.createChallenge(userIdentifier)

    const options = await generateAuthenticationOptions({
      rpID: relyingPartyId,
      challenge: challenge,
      userVerification: 'required',
      allowCredentials: user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        transports: passkey.transports?.split(',') as AuthenticatorTransportFuture[] | undefined,
      })),
    })

    this.webauthnChallengeService.storeChallenge(userIdentifier, options.challenge)

    return JSON.stringify(options)
  }

  async complete(input: WebAuthnAuthenticationCompleteInput): Promise<WebAuthnAuthenticationCompleteResult> {
    const { user, authenticationResponseJSON } = input

    const relyingPartyOrigin = getValueFromEnv('WEBAUTHN_RP_ORIGIN')
    const relyingPartyId = new URL(relyingPartyOrigin).hostname

    const userIdentifier = user.email.toLowerCase().trim()
    const getChallenge = this.webauthnChallengeService.getChallenge(userIdentifier)

    if (!getChallenge)
      throw Error(`${this.constructor.name} | complete | Missing challenge information for ${userIdentifier}`)

    const authenticationResponse = JSON.parse(authenticationResponseJSON) as AuthenticationResponseJSON
    const passkey = await this.passkeyRepository.getPasskeyById(authenticationResponse.id)

    if (!passkey) throw Error(`${this.constructor.name} | complete | Missing passkey for ${authenticationResponse.id}`)

    const { authenticationInfo } = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: getChallenge.challenge,
      expectedOrigin: relyingPartyOrigin,
      expectedRPID: relyingPartyId,
      credential: {
        id: passkey.credentialId,
        publicKey: passkey.credentialPublicKey,
        counter: passkey.counter,
        transports: passkey.transports?.split(',') as AuthenticatorTransportFuture[] | undefined,
      },
    })
    this.webauthnChallengeService.deleteChallenge(userIdentifier)

    const { userVerified, newCounter } = authenticationInfo

    if (!userVerified) return false

    const updatedPasskey = await this.passkeyRepository.updatePasskey(passkey.credentialId, { counter: newCounter })
    const signatureDER = base64url.toBuffer(authenticationResponse.response.signature)

    return {
      passkey: updatedPasskey,
      clientDataJSON: authenticationResponse.response.clientDataJSON,
      authenticatorData: authenticationResponse.response.authenticatorData,
      compactSignature: this.compactSignature(signatureDER),
    }
  }

  private compactSignature(signatureDER: Buffer): Buffer {
    const CURVE_ORDER = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551')
    const HALF_CURVE_ORDER = CURVE_ORDER / 2n

    let offset = 2

    if (signatureDER[offset] !== 0x02) throw new Error('Invalid signature format')
    offset++
    const rLength = signatureDER[offset]
    offset++
    const r = BigInt('0x' + signatureDER.slice(offset, offset + rLength).toString('hex'))
    offset += rLength

    if (signatureDER[offset] !== 0x02) throw new Error('Invalid signature format')
    offset++
    const sLength = signatureDER[offset]
    offset++
    let s = BigInt('0x' + signatureDER.slice(offset, offset + sLength).toString('hex'))

    if (s > HALF_CURVE_ORDER) {
      s = CURVE_ORDER - s
    }

    const rBuf = Buffer.alloc(32)
    const sBuf = Buffer.alloc(32)

    const rHex = r.toString(16).padStart(64, '0')
    const sHex = s.toString(16).padStart(64, '0')

    rBuf.write(rHex, 'hex')
    sBuf.write(sHex, 'hex')

    return Buffer.concat([rBuf, sBuf])
  }
}
