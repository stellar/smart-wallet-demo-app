import { Request, Response } from 'express'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { LogIn } from '.'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { mockPasskeyRepository } from 'api/core/services/passkey/mocks'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'
import { userFactory } from 'api/core/entities/user/factory'
import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
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
const mockAuthenticationResponse = {
  passkey: { credentialId: 'test-credential-id' },
  clientDataJSON: 'client-data-json',
  authenticatorData: 'authenticator-data',
  signatureDER: base64url.toBuffer('signature-base64url'),
}

const mockedUserRepository = mockUserRepository()
const mockedPasskeyRepository = mockPasskeyRepository()
const mockedWebauthnChallenge = mockWebauthnChallenge()

const mockedCompleteAuthentication = vi.fn()
vi.mock('api/core/helpers/webauthn/authentication/complete-authentication', () => ({
  completeAuthentication: (args: unknown) => mockedCompleteAuthentication(args),
}))

let useCase: LogIn

describe('LogIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new LogIn(mockedUserRepository, mockedPasskeyRepository, mockedWebauthnChallenge)
  })

  it('should return token when login completes successfuly', async () => {
    const payload = {
      email: mockUser.email,
      authentication_response_json: '{"id":"TestPayload123"}',
    }

    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedCompleteAuthentication.mockResolvedValueOnce(mockAuthenticationResponse)

    const result = await useCase.handle(payload)

    expect(result.data.token).toBe('valid-token')
    expect(result.message).toBe('Log in completed successfully')
  })

  it('should throw ResourceNotFoundException when user does not exist', async () => {
    const payload = {
      email: 'notfound@example.com',
      authentication_response_json: '{"id":"TestPayload123"}',
    }
    mockedUserRepository.getUserByEmail.mockResolvedValue(null)

    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedCompleteAuthentication).not.toHaveBeenCalled()
  })

  it('should throw UnauthorizedException when auth fails', async () => {
    const payload = {
      email: mockUser.email,
      authentication_response_json: '{"id":"TestPayload123"}',
    }
    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedCompleteAuthentication.mockResolvedValueOnce(false)

    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = {
      body: { email: mockUser.email, authentication_response_json: '{"id":"TestPayload123"}' },
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedCompleteAuthentication.mockResolvedValueOnce(mockAuthenticationResponse)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        token: 'valid-token',
      },
      message: 'Log in completed successfully',
    })
  })

  it('should validate payload and throw on invalid data', async () => {
    const req = {
      body: { email: mockUser.email }, // Missing required fields
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    await expect(useCase.executeHttp(req, res)).rejects.toThrow()
  })
})
