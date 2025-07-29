import { Request, Response } from 'express'

import { userFactory } from 'api/core/entities/user/factory'
import { mockWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { CreateWalletOptions } from '.'

const mockUser = userFactory({ email: 'test@example.com' })

const mockedUserRepository = mockUserRepository()
const mockedWebauthnRegistrationHelper = mockWebAuthnRegistration()

const mockedGenerateRegistrationOptions = vi.fn()
mockedWebauthnRegistrationHelper.generateOptions = mockedGenerateRegistrationOptions

let useCase: CreateWalletOptions

describe('CreateWalletOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateWalletOptions(mockedUserRepository, mockedWebauthnRegistrationHelper)
  })

  it('should return options_json when user exists', async () => {
    const payload = {
      email: mockUser.email,
    }
    const optionsJSON = { challenge: 'abc123' }

    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedGenerateRegistrationOptions.mockResolvedValue(optionsJSON)

    const result = await useCase.handle(payload)

    expect(result.data.options_json).toBe(optionsJSON)
    expect(result.message).toBe('Retrieved create wallet options successfully')
  })

  it('should throw ResourceNotFoundException when user does not exist', async () => {
    const payload = {
      email: 'notfound@example.com',
    }
    mockedUserRepository.getUserByEmail.mockResolvedValue(null)

    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedGenerateRegistrationOptions).not.toHaveBeenCalled()
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
    mockedGenerateRegistrationOptions.mockResolvedValue(optionsJSON)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        options_json: optionsJSON,
      },
      message: 'Retrieved create wallet options successfully',
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
