import {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  Base64URLString,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import base64url from 'base64url'
import { getValueFromEnv } from 'config/env-utils'
import { Passkey, PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { User } from 'api/core/entities/user/types'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

export const completeAuthentication = async ({
  user,
  authenticationResponseJSON,
  passkeyRepository,
  webauthnChallengeService,
}: {
  user: User
  authenticationResponseJSON: string
  passkeyRepository: PasskeyRepositoryType
  webauthnChallengeService: IWebauthnChallengeService
}): Promise<
  | {
      passkey: Passkey
      clientDataJSON: Base64URLString
      authenticatorData: Base64URLString
      signatureDER: Buffer
    }
  | false
> => {
  const relyingPartyOrigin = getValueFromEnv('WEBAUTHN_RP_ORIGIN')
  const relyingPartyId = new URL(relyingPartyOrigin).hostname

  const userIdentifier = user.email.toLowerCase().trim()
  const getChallenge = webauthnChallengeService.getChallenge(userIdentifier)

  if (!getChallenge)
    throw Error(
      `completeAuthentication | webauthnChallengeService.getChallenge | Missing challenge information for ${userIdentifier}`
    )

  const authenticationResponse = JSON.parse(authenticationResponseJSON) as AuthenticationResponseJSON
  const passkey = await passkeyRepository.getPasskeyById(authenticationResponse.id)

  if (!passkey)
    throw Error(
      `completeAuthentication | passkeyRepository.getPasskeyById | Missing passkey for ${authenticationResponse.id}`
    )

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
  webauthnChallengeService.deleteChallenge(userIdentifier)

  const { userVerified, newCounter } = authenticationInfo

  if (!userVerified) return false

  const updatedPasskey = await passkeyRepository.updatePasskey(passkey.credentialId, { counter: newCounter })

  return {
    passkey: updatedPasskey,
    clientDataJSON: authenticationResponse.response.clientDataJSON,
    authenticatorData: authenticationResponse.response.authenticatorData,
    signatureDER: base64url.toBuffer(authenticationResponse.response.signature),
  }
}
