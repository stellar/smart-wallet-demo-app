import { generateRegistrationOptions as generateOptions } from '@simplewebauthn/server'
import { getValueFromEnv } from 'config/env-utils'
import { User } from 'api/core/entities/user/types'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

export const generateRegistrationOptions = async ({
  user,
  webauthnChallengeService,
  device,
}: {
  user: User
  webauthnChallengeService: IWebauthnChallengeService
  device?: string
}): Promise<string> => {
  const relyingPartyName = getValueFromEnv('WEBAUTHN_RP_NAME')
  const relyingPartyId = new URL(getValueFromEnv('WEBAUTHN_RP_ORIGIN')).hostname

  const userIdentifier = user.email.toLowerCase().trim()
  const userDisplayName = `${relyingPartyName} | ${device || 'My Device'}`.trim()
  const challenge = webauthnChallengeService.createChallenge(userIdentifier)

  const options = await generateOptions({
    rpName: relyingPartyName,
    rpID: relyingPartyId,
    userID: Buffer.from(userIdentifier),
    userName: userIdentifier,
    userDisplayName: userDisplayName,
    challenge: challenge,
    supportedAlgorithmIDs: [-7],
    attestationType: 'none',
    excludeCredentials: user.passkeys.map(passkey => ({
      id: passkey.credentialId,
      transports: passkey.transportsArray,
    })),
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'required',
    },
  })

  webauthnChallengeService.setMetadata(userIdentifier, { label: userDisplayName, userId: options.user.id })

  return JSON.stringify(options)
}
