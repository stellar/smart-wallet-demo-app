import base64url from 'base64url'

import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { Passkey } from 'api/core/entities/passkey/types'
import { userFactory } from 'api/core/entities/user/factory'
import { mockPasskeyRepository } from 'api/core/services/passkey/mocks'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'

import { completeAuthentication } from './complete-authentication'

const mockChallenge = {
  challenge: 'mockChallenge',
  expiresAt: Date.now() + 5 * 60 * 1000, // 5 min TTL
  metadata: {
    userId: 'user-id',
    label: 'Test Label',
  },
}
const mockAuthenticationResponseJSON = JSON.stringify({
  id: 'cred-id',
  response: {
    clientDataJSON: 'client-data-json',
    authenticatorData: 'authenticator-data',
    signature: 'signature-base64url',
  },
})
const mockUser = userFactory({ email: 'test@example.com' })
const mockPasskey = passkeyFactory({
  credentialId: 'cred-id',
  credentialPublicKey: Buffer.from('public-key'),
  counter: 1,
  transports: ['usb', 'nfc'],
})

const mockedPasskeyRepository = mockPasskeyRepository()
const mockedWebauthnChallengeService = mockWebauthnChallenge()

const mockedVerifyAuthenticationResponse = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  verifyAuthenticationResponse: () => mockedVerifyAuthenticationResponse(),
}))

describe('completeAuthentication', () => {
  beforeEach(() => {
    mockedVerifyAuthenticationResponse.mockResolvedValue({
      authenticationInfo: {
        userVerified: true,
        newCounter: 2,
      },
    })

    mockedPasskeyRepository.getPasskeyById.mockResolvedValue(mockPasskey)
    mockedPasskeyRepository.updatePasskey.mockResolvedValue({ ...mockPasskey, counter: 2 } as Passkey)
    mockedWebauthnChallengeService.getChallenge.mockReturnValue(mockChallenge)
  })

  it('should complete authentication and return expected result', async () => {
    const result = await completeAuthentication({
      user: mockUser,
      authenticationResponseJSON: mockAuthenticationResponseJSON,
      passkeyRepository: mockedPasskeyRepository,
      webauthnChallengeService: mockedWebauthnChallengeService,
    })

    expect(result).toEqual({
      passkey: { ...mockPasskey, counter: 2 },
      clientDataJSON: 'client-data-json',
      authenticatorData: 'authenticator-data',
      signatureDER: base64url.toBuffer('signature-base64url'),
    })
    expect(mockedPasskeyRepository.getPasskeyById).toHaveBeenCalledWith('cred-id')
    expect(mockedPasskeyRepository.updatePasskey).toHaveBeenCalledWith('cred-id', { counter: 2 })
    expect(mockedWebauthnChallengeService.deleteChallenge).toHaveBeenCalledWith('test@example.com')
  })

  it('should throw if challenge is missing', async () => {
    mockedWebauthnChallengeService.getChallenge.mockReturnValue(null)
    await expect(
      completeAuthentication({
        user: mockUser,
        authenticationResponseJSON: mockAuthenticationResponseJSON,
        passkeyRepository: mockedPasskeyRepository,
        webauthnChallengeService: mockedWebauthnChallengeService,
      })
    ).rejects.toThrow(/Missing challenge information/)
  })

  it('should throw if passkey is missing', async () => {
    mockedPasskeyRepository.getPasskeyById.mockResolvedValue(null)
    await expect(
      completeAuthentication({
        user: mockUser,
        authenticationResponseJSON: mockAuthenticationResponseJSON,
        passkeyRepository: mockedPasskeyRepository,
        webauthnChallengeService: mockedWebauthnChallengeService,
      })
    ).rejects.toThrow(/Missing passkey/)
  })

  it('should return false if userVerified is false', async () => {
    mockedVerifyAuthenticationResponse.mockResolvedValue({
      authenticationInfo: {
        userVerified: false,
        newCounter: 2,
      },
    })
    const result = await completeAuthentication({
      user: mockUser,
      authenticationResponseJSON: mockAuthenticationResponseJSON,
      passkeyRepository: mockedPasskeyRepository,
      webauthnChallengeService: mockedWebauthnChallengeService,
    })
    expect(result).toBe(false)
  })
})
