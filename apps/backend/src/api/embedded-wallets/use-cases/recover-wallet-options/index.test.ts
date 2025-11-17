import { Request, Response } from 'express'

import { otpFactory } from 'api/core/entities/otp/factory'
import { Otp } from 'api/core/entities/otp/types'
import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { mockWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/mocks'
import { mockOtpRepository } from 'api/core/services/otp/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { RecoverWalletOptions } from '.'

const mockedPasskeys = [
  passkeyFactory({
    credentialId: 'cred-1',
    transports: ['usb', 'nfc'],
  }),
  passkeyFactory({
    credentialId: 'cred-2',
    transports: ['cable'],
  }),
]
const mockedUser = userFactory({ passkeys: mockedPasskeys })
const mockedOtp = otpFactory({ user: mockedUser })

const mockedOtpRepository = mockOtpRepository()
const mockedWebauthnRegistrationHelper = mockWebAuthnRegistration()

const mockedGenerateRegistrationOptions = vi.fn()
mockedWebauthnRegistrationHelper.generateOptions = mockedGenerateRegistrationOptions

let useCase: RecoverWalletOptions

describe('RecoverWalletOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new RecoverWalletOptions(mockedOtpRepository, mockedWebauthnRegistrationHelper)
  })

  it('should return options_json when otp exists and not expired', async () => {
    const payload = {
      code: mockedOtp.code,
    }
    const optionsJSON = { challenge: 'abc123' }

    mockedOtpRepository.getOtpByCode.mockResolvedValue(mockedOtp)
    mockedGenerateRegistrationOptions.mockResolvedValue(optionsJSON)

    const result = await useCase.handle(payload)

    expect(result.data.options_json).toBe(optionsJSON)
    expect(result.message).toBe('Retrieved recover wallet options successfully')
  })

  it('should throw ResourceNotFoundException when otp does not exist', async () => {
    const payload = {
      code: 'ERROR1',
    }
    mockedOtpRepository.getOtpByCode.mockResolvedValue(null)

    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedGenerateRegistrationOptions).not.toHaveBeenCalled()
  })

  it('should throw BadRequestException when otp is expired', async () => {
    const payload = {
      code: 'ERROR2',
    }
    mockedOtpRepository.getOtpByCode.mockResolvedValue({ ...mockedOtp, expiresAt: new Date(Date.now() - 1000) } as Otp)

    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(BadRequestException)
    expect(mockedGenerateRegistrationOptions).not.toHaveBeenCalled()
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = {
      params: { code: mockedOtp.code },
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response
    const optionsJSON = { challenge: 'abc123' }

    mockedOtpRepository.getOtpByCode.mockResolvedValue(mockedOtp)
    mockedGenerateRegistrationOptions.mockResolvedValue(optionsJSON)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        options_json: optionsJSON,
      },
      message: 'Retrieved recover wallet options successfully',
    })
  })

  it('should validate payload and throw on invalid data', async () => {
    const req = {
      params: { invalid: 'invalid' }, // Missing required fields
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    await expect(useCase.executeHttp(req, res)).rejects.toThrow()
  })
})
