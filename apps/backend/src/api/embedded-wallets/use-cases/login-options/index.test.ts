import { Request, Response } from 'express'

import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { LogInOptions } from '.'

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

const mockedUserRepository = mockUserRepository()
const mockedWebauthnAuthenticationHelper = mockWebAuthnAuthentication()

const mockedGenerateAuthenticationOptions = vi.fn()
mockedWebauthnAuthenticationHelper.generateOptions = mockedGenerateAuthenticationOptions

let useCase: LogInOptions

describe('LogInOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new LogInOptions(mockedUserRepository, mockedWebauthnAuthenticationHelper)
  })

  it('should return options_json when user exists', async () => {
    const payload = {
      email: mockUser.email,
    }
    const optionsJSON = { challenge: 'abc123' }

    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedGenerateAuthenticationOptions.mockResolvedValue(optionsJSON)

    const result = await useCase.handle(payload)

    expect(result.data.options_json).toBe(optionsJSON)
    expect(result.message).toBe('Retrieved log in options successfully')
  })

  it('should throw ResourceNotFoundException when user does not exist', async () => {
    const payload = {
      email: 'notfound@example.com',
    }
    mockedUserRepository.getUserByEmail.mockResolvedValue(null)

    const result = await useCase.handle(payload)

    expect(result.data.options_json).toBe(null)
    expect(mockedGenerateAuthenticationOptions).not.toHaveBeenCalled()
  })

  it('should throw ResourceNotFoundException when user passkeys are empty', async () => {
    const payload = {
      email: mockUser.email,
    }
    mockedUserRepository.getUserByEmail.mockResolvedValue({ ...mockUser, passkeys: [] } as unknown as User)

    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedGenerateAuthenticationOptions).not.toHaveBeenCalled()
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = {
      params: { email: mockUser.email },
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response
    const optionsJSON = { challenge: 'abc123' }

    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedGenerateAuthenticationOptions.mockResolvedValue(optionsJSON)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        options_json: optionsJSON,
      },
      message: 'Retrieved log in options successfully',
    })
  })

  it('should validate payload and throw on invalid data', async () => {
    const req = {
      params: { email: 'invalid-email' }, // Missing required fields
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    await expect(useCase.executeHttp(req, res)).rejects.toThrow()
  })
})
