import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { mockPasskeyRepository } from 'api/core/services/passkey/mocks'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'

import { completeRegistration } from './complete-registration'

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
const mockUser = userFactory({ email: 'test@example.com' })
const mockPasskey = passkeyFactory({})

const mockedPasskeyRepository = mockPasskeyRepository()
const mockedWebauthnChallengeService = mockWebauthnChallenge()

const mockedVerifyRegistrationResponse = vi.fn()
const mockedExtractPublicKey = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  verifyRegistrationResponse: () => mockedVerifyRegistrationResponse(),
}))
vi.mock('./extract-public-key', () => ({
  extractPublicKey: () => mockedExtractPublicKey(),
}))

describe('completeRegistration', () => {
  beforeEach(() => {
    mockedVerifyRegistrationResponse.mockResolvedValue({ registrationInfo: mockRegistrationInfo })
    mockedExtractPublicKey.mockReturnValue('hex-public-key')

    mockedPasskeyRepository.createPasskey.mockResolvedValue(mockPasskey)
    mockedWebauthnChallengeService.getChallenge.mockReturnValue(mockChallenge)
  })

  it('should complete registration and return passkey and publicKeyHex', async () => {
    const result = await completeRegistration({
      user: mockUser,
      registrationResponseJSON: mockRegistrationResponseJSON,
      passkeyRepository: mockedPasskeyRepository,
      webauthnChallengeService: mockedWebauthnChallengeService,
    })

    expect(result).toEqual({ passkey: mockPasskey, publicKeyHex: 'hex-public-key' })
    expect(mockedPasskeyRepository.createPasskey).toHaveBeenCalled()
    expect(mockedWebauthnChallengeService.deleteChallenge).toHaveBeenCalledWith('test@example.com')
  })

  it('should throw error if challenge is missing', async () => {
    mockedWebauthnChallengeService.getChallenge.mockReturnValue(null)
    await expect(
      completeRegistration({
        user: mockUser,
        registrationResponseJSON: mockRegistrationResponseJSON,
        passkeyRepository: mockedPasskeyRepository,
        webauthnChallengeService: mockedWebauthnChallengeService,
      })
    ).rejects.toThrow(/Missing challenge information/)
  })

  it('should throw error if registrationInfo is missing', async () => {
    mockedVerifyRegistrationResponse.mockResolvedValue({ registrationInfo: undefined })
    await expect(
      completeRegistration({
        user: mockUser,
        registrationResponseJSON: mockRegistrationResponseJSON,
        passkeyRepository: mockedPasskeyRepository,
        webauthnChallengeService: mockedWebauthnChallengeService,
      })
    ).rejects.toThrow(/Missing registrationInfo/)
  })

  it('should return false if userVerified is false', async () => {
    mockedVerifyRegistrationResponse.mockResolvedValue({
      registrationInfo: { ...mockRegistrationInfo, userVerified: false },
    })
    const result = await completeRegistration({
      user: mockUser,
      registrationResponseJSON: mockRegistrationResponseJSON,
      passkeyRepository: mockedPasskeyRepository,
      webauthnChallengeService: mockedWebauthnChallengeService,
    })
    expect(result).toBe(false)
  })
})
