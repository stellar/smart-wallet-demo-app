import { AuthenticatorTransportFuture, generateAuthenticationOptions as generateOptions } from '@simplewebauthn/server'
import { getValueFromEnv } from 'config/env-utils'
import { User } from 'api/core/entities/user/types'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

export const generateAuthenticationOptions = async ({
  user,
  webauthnChallengeService,
}: {
  user: User
  webauthnChallengeService: IWebauthnChallengeService
}): Promise<string> => {
  const relyingPartyId = new URL(getValueFromEnv('WEBAUTHN_RP_ORIGIN')).hostname

  const userIdentifier = user.email.toLowerCase().trim()
  const challenge = webauthnChallengeService.createChallenge(userIdentifier)

  const options = await generateOptions({
    rpID: relyingPartyId,
    challenge: challenge,
    userVerification: 'required',
    allowCredentials: user.passkeys.map(passkey => ({
      id: passkey.credentialId,
      transports: passkey.transports?.split(',') as AuthenticatorTransportFuture[] | undefined,
    })),
  })

  webauthnChallengeService.storeChallenge(userIdentifier, options.challenge)

  return JSON.stringify(options)
}
