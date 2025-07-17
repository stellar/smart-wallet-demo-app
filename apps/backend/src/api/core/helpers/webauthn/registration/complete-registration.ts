import { RegistrationResponseJSON, verifyRegistrationResponse } from '@simplewebauthn/server'
import { getValueFromEnv } from 'config/env-utils'
import { Passkey, PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { User } from 'api/core/entities/user/types'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'
import { extractPublicKey } from './extract-public-key'

export const completeRegistration = async ({
  user,
  registrationResponseJSON,
  passkeyRepository,
  webauthnChallengeService,
}: {
  user: User
  registrationResponseJSON: string
  passkeyRepository: PasskeyRepositoryType
  webauthnChallengeService: IWebauthnChallengeService
}): Promise<{ passkey: Passkey; publicKeyHex: string | null } | false> => {
  const relyingPartyOrigin = getValueFromEnv('WEBAUTHN_RP_ORIGIN')
  const relyingPartyId = new URL(relyingPartyOrigin).hostname

  const userIdentifier = user.email.toLowerCase().trim()
  const getChallenge = webauthnChallengeService.getChallenge(userIdentifier)

  if (!getChallenge || !getChallenge.metadata)
    throw Error(
      `completeRegistration | webauthnChallengeService.getChallenge | Missing challenge information for ${userIdentifier}`
    )

  const registrationResponse = JSON.parse(registrationResponseJSON) as RegistrationResponseJSON
  const { registrationInfo } = await verifyRegistrationResponse({
    response: registrationResponse,
    expectedChallenge: getChallenge.challenge,
    expectedOrigin: relyingPartyOrigin,
    expectedRPID: relyingPartyId,
  })
  webauthnChallengeService.deleteChallenge(userIdentifier)

  if (!registrationInfo)
    throw Error(`completeRegistration | verifyRegistrationResponse | Missing registrationInfo for ${userIdentifier}`)

  const { userVerified, credential, credentialDeviceType, credentialBackedUp } = registrationInfo

  if (!userVerified) return false

  const passkey = await passkeyRepository.createPasskey(
    {
      user,
      webauthnUserId: getChallenge.metadata.userId,
      label: getChallenge.metadata.label,
      credentialId: credential.id,
      credentialPublicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports?.join(','),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    },
    true
  )

  return { passkey, publicKeyHex: extractPublicKey(registrationResponse.response) }
}
