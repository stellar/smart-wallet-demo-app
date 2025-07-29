import base64url from 'base64url'

import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { mockPasskeyRepository } from 'api/core/services/passkey/mocks'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'

import { IWebAuthnRegistration } from './types'

import WebAuthnRegistration from '.'

const mockChallenge = {
  challenge: 'mockChallenge',
  expiresAt: Date.now() + 5 * 60 * 1000, // 5 min TTL
  metadata: {
    userId: 'user-id',
    label: 'Test Label',
  },
}
const mockRegistrationResponseJSON = JSON.stringify({
  id: 'credential-id',
  rawId: 'raw-id',
  response: {},
  type: 'public-key',
})
const mockCredential = {
  id: 'credential-id',
  publicKey: 'public-key',
  counter: 1,
  transports: ['usb', 'nfc'],
}
const mockRegistrationInfo = {
  userVerified: true,
  credential: mockCredential,
  credentialDeviceType: 'singleDevice',
  credentialBackedUp: false,
}

const mockPasskeys = [
  passkeyFactory({
    credentialId: 'cred-1',
    transports: ['usb', 'nfc'],
  }),
  passkeyFactory({
    credentialId: 'cred-2',
    transports: ['cable'],
  }),
]
const mockUser = userFactory({ email: 'test@example.com', passkeys: mockPasskeys })
const mockPasskey = passkeyFactory({})

const mockedPasskeyRepository = mockPasskeyRepository()
const mockedWebauthnChallengeService = mockWebauthnChallenge()

const mockedGenerateOptions = vi.fn()
const mockedVerifyRegistrationResponse = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: (args: unknown) => mockedGenerateOptions(args),
  verifyRegistrationResponse: () => mockedVerifyRegistrationResponse(),
}))

describe('WebAuthnRegistration', () => {
  let webauthnRegistration: IWebAuthnRegistration

  beforeEach(() => {
    webauthnRegistration = new WebAuthnRegistration(mockedPasskeyRepository, mockedWebauthnChallengeService)
  })

  describe('generateOptions', () => {
    const generateOptionsArgs = {
      rpName: 'Smart Wallet Demo',
      rpID: 'localhost',
      userID: base64url.toBuffer('test@example.com'),
      userName: 'test@example.com',
      userDisplayName: 'Smart Wallet Demo | Laptop',
      challenge: 'challenge123',
      supportedAlgorithmIDs: [-7],
      attestationType: 'none',
      excludeCredentials: [
        {
          id: 'cred-1',
          transports: ['usb', 'nfc'],
        },
        {
          id: 'cred-2',
          transports: ['cable'],
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
    }

    beforeEach(() => {
      mockedWebauthnChallengeService.createChallenge.mockReturnValue('challenge123')

      mockedGenerateOptions.mockResolvedValue({
        challenge: 'challenge123',
        user: { id: 'user-id-xyz' },
        rp: { name: 'Smart Wallet Demo', id: 'localhost' },
        excludeCredentials: [],
        authenticatorSelection: {},
      })
    })

    it('should generate registration options and call challenge service methods', async () => {
      const result = await webauthnRegistration.generateOptions({
        user: mockUser,
        device: 'Laptop',
      })

      expect(mockedWebauthnChallengeService.createChallenge).toHaveBeenCalledWith('test@example.com')
      expect(mockedGenerateOptions).toHaveBeenCalledWith(generateOptionsArgs)
      expect(mockedWebauthnChallengeService.storeChallenge).toHaveBeenCalledWith('test@example.com', 'challenge123')
      expect(mockedWebauthnChallengeService.setMetadata).toHaveBeenCalledWith('test@example.com', {
        label: 'Smart Wallet Demo | Laptop',
        userId: 'user-id-xyz',
      })
      expect(result).toBe(
        JSON.stringify({
          challenge: 'challenge123',
          user: { id: 'user-id-xyz' },
          rp: { name: 'Smart Wallet Demo', id: 'localhost' },
          excludeCredentials: [],
          authenticatorSelection: {},
        })
      )
    })

    it('should use default device label when device is not provided', async () => {
      await webauthnRegistration.generateOptions({
        user: mockUser,
      })
      expect(mockedGenerateOptions).toHaveBeenCalledWith({
        ...generateOptionsArgs,
        userDisplayName: 'Smart Wallet Demo | My Device',
      })
    })

    it('should trim and lowercase user email', async () => {
      await webauthnRegistration.generateOptions({
        user: mockUser,
        device: 'Phone',
      })
      expect(mockedGenerateOptions).toHaveBeenCalledWith({
        ...generateOptionsArgs,
        userName: 'test@example.com',
      })
    })
  })

  describe('complete', () => {
    beforeEach(() => {
      mockedVerifyRegistrationResponse.mockResolvedValue({ registrationInfo: mockRegistrationInfo })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.spyOn(webauthnRegistration, 'extractPublicKey').mockReturnValue('hex-public-key')

      mockedPasskeyRepository.createPasskey.mockResolvedValue(mockPasskey)
      mockedWebauthnChallengeService.getChallenge.mockReturnValue(mockChallenge)
    })

    it('should complete registration and return passkey', async () => {
      const result = await webauthnRegistration.complete({
        user: mockUser,
        registrationResponseJSON: mockRegistrationResponseJSON,
      })

      expect(result).toEqual({ passkey: mockPasskey })
      expect(mockedPasskeyRepository.createPasskey).toHaveBeenCalled()
      expect(mockedWebauthnChallengeService.deleteChallenge).toHaveBeenCalledWith('test@example.com')
    })

    it('should throw error if challenge is missing', async () => {
      mockedWebauthnChallengeService.getChallenge.mockReturnValue(null)
      await expect(
        webauthnRegistration.complete({
          user: mockUser,
          registrationResponseJSON: mockRegistrationResponseJSON,
        })
      ).rejects.toThrow(/Missing challenge information/)
    })

    it('should throw error if registrationInfo is missing', async () => {
      mockedVerifyRegistrationResponse.mockResolvedValue({ registrationInfo: undefined })
      await expect(
        webauthnRegistration.complete({
          user: mockUser,
          registrationResponseJSON: mockRegistrationResponseJSON,
        })
      ).rejects.toThrow(/Missing registrationInfo/)
    })

    it('should return false if userVerified is false', async () => {
      mockedVerifyRegistrationResponse.mockResolvedValue({
        registrationInfo: { ...mockRegistrationInfo, userVerified: false },
      })
      const result = await webauthnRegistration.complete({
        user: mockUser,
        registrationResponseJSON: mockRegistrationResponseJSON,
      })
      expect(result).toBe(false)
    })
  })
})
