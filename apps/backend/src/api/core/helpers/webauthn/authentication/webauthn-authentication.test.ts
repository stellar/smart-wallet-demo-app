import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { Passkey } from 'api/core/entities/passkey/types'
import { userFactory } from 'api/core/entities/user/factory'
import { mockPasskeyRepository } from 'api/core/services/passkey/mocks'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'

import { IWebAuthnAuthentication } from './types'

import WebAuthnAuthentication from '.'

const mockChallenge = {
  challenge: 'mockChallenge',
  expiresAt: Date.now() + 5 * 60 * 1000, // 5 min TTL
  metadata: {
    userId: 'user-id',
    label: 'Test Label',
  },
}
const mockAuthenticationResponseJSON = JSON.stringify({
  id: 'cred-1',
  response: {
    clientDataJSON: 'client-data-json',
    authenticatorData: 'authenticator-data',
    signature: 'signature-base64url',
  },
})

const mockPasskeys = [
  passkeyFactory({
    credentialId: 'cred-1',
    credentialPublicKey: Buffer.from('public-key'),
    counter: 1,
    transports: ['usb', 'nfc'],
  }),
  passkeyFactory({
    credentialId: 'cred-2',
    transports: ['cable'],
  }),
]
const mockUser = userFactory({ email: 'test@Example.com ', passkeys: mockPasskeys })

const mockedPasskeyRepository = mockPasskeyRepository()
const mockedWebauthnChallengeService = mockWebauthnChallenge()

const mockedVerifyAuthenticationResponse = vi.fn()
const mockedGenerateOptions = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: (args: unknown) => mockedGenerateOptions(args),
  verifyAuthenticationResponse: () => mockedVerifyAuthenticationResponse(),
}))

describe('WebAuthnAuthentication', () => {
  let webauthnAuthentication: IWebAuthnAuthentication

  beforeEach(() => {
    webauthnAuthentication = new WebAuthnAuthentication(mockedPasskeyRepository, mockedWebauthnChallengeService)
  })

  describe('generateOptions', () => {
    beforeEach(() => {
      mockedWebauthnChallengeService.createChallenge.mockReturnValue('challenge-xyz')
      mockedGenerateOptions.mockResolvedValue({
        challenge: 'challenge-xyz',
        rpID: 'localhost',
        allowCredentials: [
          { id: 'cred-1', transports: ['usb', 'nfc'] },
          { id: 'cred-2', transports: ['cable'] },
        ],
        userVerification: 'required',
      })
    })

    it('should generate authentication options and call challenge service methods', async () => {
      const result = await webauthnAuthentication.generateOptions({
        user: mockUser,
      })

      expect(mockedWebauthnChallengeService.createChallenge).toHaveBeenCalledWith('test@example.com')
      expect(mockedGenerateOptions).toHaveBeenCalledWith({
        rpID: 'localhost',
        challenge: 'challenge-xyz',
        userVerification: 'required',
        allowCredentials: [
          { id: 'cred-1', transports: ['usb', 'nfc'] },
          { id: 'cred-2', transports: ['cable'] },
        ],
      })
      expect(mockedWebauthnChallengeService.storeChallenge).toHaveBeenCalledWith('test@example.com', 'challenge-xyz')
      expect(result).toBe(
        JSON.stringify({
          challenge: 'challenge-xyz',
          rpID: 'localhost',
          allowCredentials: [
            { id: 'cred-1', transports: ['usb', 'nfc'] },
            { id: 'cred-2', transports: ['cable'] },
          ],
          userVerification: 'required',
        })
      )
    })

    it('should trim and lowercase user email before challenge creation', async () => {
      await webauthnAuthentication.generateOptions({
        user: mockUser,
      })
      expect(mockedWebauthnChallengeService.createChallenge).toHaveBeenCalledWith('test@example.com')
    })

    it('should handle empty passkeys array', async () => {
      const userNoPasskeys = userFactory({ email: 'user@domain.com', passkeys: [] })
      await webauthnAuthentication.generateOptions({
        user: userNoPasskeys,
      })
      expect(mockedGenerateOptions).toHaveBeenCalledWith({
        rpID: 'localhost',
        challenge: 'challenge-xyz',
        userVerification: 'required',
        allowCredentials: [],
      })
    })
  })

  describe('complete', () => {
    const mockPasskey = mockPasskeys[0]

    beforeEach(() => {
      mockedVerifyAuthenticationResponse.mockResolvedValue({
        authenticationInfo: {
          userVerified: true,
          newCounter: 2,
        },
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.spyOn(webauthnAuthentication, 'compactSignature').mockReturnValue('compact-signature')

      mockedPasskeyRepository.getPasskeyById.mockResolvedValue(mockPasskey)
      mockedPasskeyRepository.updatePasskey.mockResolvedValue({ ...mockPasskey, counter: 2 } as Passkey)
      mockedWebauthnChallengeService.getChallenge.mockReturnValue(mockChallenge)
    })

    it('should complete authentication and return expected result', async () => {
      const result = await webauthnAuthentication.complete({
        user: mockUser,
        authenticationResponseJSON: mockAuthenticationResponseJSON,
      })

      expect(result).toEqual({
        passkey: { ...mockPasskey, counter: 2 },
        clientDataJSON: 'client-data-json',
        authenticatorData: 'authenticator-data',
        compactSignature: 'compact-signature',
      })
      expect(mockedPasskeyRepository.getPasskeyById).toHaveBeenCalledWith('cred-1')
      expect(mockedPasskeyRepository.updatePasskey).toHaveBeenCalledWith('cred-1', { counter: 2 })
      expect(mockedWebauthnChallengeService.deleteChallenge).toHaveBeenCalledWith('test@example.com')
    })

    it('should throw if challenge is missing', async () => {
      mockedWebauthnChallengeService.getChallenge.mockReturnValue(null)
      await expect(
        webauthnAuthentication.complete({
          user: mockUser,
          authenticationResponseJSON: mockAuthenticationResponseJSON,
        })
      ).rejects.toThrow(/Missing challenge information/)
    })

    it('should throw if passkey is missing', async () => {
      mockedPasskeyRepository.getPasskeyById.mockResolvedValue(null)
      await expect(
        webauthnAuthentication.complete({
          user: mockUser,
          authenticationResponseJSON: mockAuthenticationResponseJSON,
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
      const result = await webauthnAuthentication.complete({
        user: mockUser,
        authenticationResponseJSON: mockAuthenticationResponseJSON,
      })
      expect(result).toBe(false)
    })
  })
})
