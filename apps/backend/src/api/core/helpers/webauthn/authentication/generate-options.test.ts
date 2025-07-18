import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'

import { generateAuthenticationOptions } from './generate-options'

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
const mockUser = userFactory({ email: 'Test@Example.com ', passkeys: mockPasskeys })

const mockedWebauthnChallengeService = mockWebauthnChallenge()

const mockedGenerateOptions = vi.fn()
vi.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: (args: unknown) => mockedGenerateOptions(args),
}))

describe('generateAuthenticationOptions', () => {
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
    const result = await generateAuthenticationOptions({
      user: mockUser,
      webauthnChallengeService: mockedWebauthnChallengeService,
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
    await generateAuthenticationOptions({
      user: mockUser,
      webauthnChallengeService: mockedWebauthnChallengeService,
    })
    expect(mockedWebauthnChallengeService.createChallenge).toHaveBeenCalledWith('test@example.com')
  })

  it('should handle empty passkeys array', async () => {
    const userNoPasskeys = userFactory({ email: 'user@domain.com', passkeys: [] })
    await generateAuthenticationOptions({
      user: userNoPasskeys,
      webauthnChallengeService: mockedWebauthnChallengeService,
    })
    expect(mockedGenerateOptions).toHaveBeenCalledWith({
      rpID: 'localhost',
      challenge: 'challenge-xyz',
      userVerification: 'required',
      allowCredentials: [],
    })
  })
})
