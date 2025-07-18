import { generateRegistrationOptions } from './generate-options'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'
import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import base64url from 'base64url'

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

const mockedWebauthnChallengeService = mockWebauthnChallenge()

const mockedGenerateOptions = vi.fn()
vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: (args: unknown) => mockedGenerateOptions(args),
}))

describe('generateRegistrationOptions', () => {
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
    const result = await generateRegistrationOptions({
      user: mockUser,
      webauthnChallengeService: mockedWebauthnChallengeService,
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
    await generateRegistrationOptions({
      user: mockUser,
      webauthnChallengeService: mockedWebauthnChallengeService,
    })
    expect(mockedGenerateOptions).toHaveBeenCalledWith({
      ...generateOptionsArgs,
      userDisplayName: 'Smart Wallet Demo | My Device',
    })
  })

  it('should trim and lowercase user email', async () => {
    await generateRegistrationOptions({
      user: mockUser,
      webauthnChallengeService: mockedWebauthnChallengeService,
      device: 'Phone',
    })
    expect(mockedGenerateOptions).toHaveBeenCalledWith({
      ...generateOptionsArgs,
      userName: 'test@example.com',
    })
  })
})
