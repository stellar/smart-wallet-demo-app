import { Request, Response } from 'express'

import { Otp } from 'api/core/entities/otp/types'
import { userFactory } from 'api/core/entities/user/factory'
import { mockOtpRepository } from 'api/core/services/otp/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { RequestSchemaT } from './types'

import { endpoint, ValidateRecoveryLink } from '.'

const mockedOtpRepository = mockOtpRepository()
const mockedUser = userFactory({})
const mockedCode = 'ABC123'

let useCase: ValidateRecoveryLink

describe('ValidateRecoveryLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new ValidateRecoveryLink(mockedOtpRepository)
  })

  it('should validate a recovery link code - true case', async () => {
    mockedOtpRepository.getOtpByCode.mockResolvedValue({
      user: mockedUser,
      code: mockedCode,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
    } as Otp)
    const result = await useCase.handle({ code: mockedCode })

    expect(result.data.is_valid).toBeTruthy()
  })

  it('should validate a recovery link code - false case', async () => {
    mockedOtpRepository.getOtpByCode.mockResolvedValue({
      user: mockedUser,
      code: mockedCode,
      expiresAt: new Date(Date.now() - 1000),
    } as Otp)
    const result = await useCase.handle({ code: mockedCode })

    expect(result.data.is_valid).toBeFalsy()
  })

  it('should throw an error if code is not found', async () => {
    mockedOtpRepository.getOtpByCode.mockResolvedValue(null)

    await expect(useCase.handle({ code: mockedCode })).rejects.toThrow(ResourceNotFoundException)
  })

  it('should thrown an error if payload is invalid', async () => {
    await expect(useCase.handle({ invalid: 'invalid' } as unknown as RequestSchemaT)).rejects.toThrowError()
    expect(mockedOtpRepository.getOtpByCode).not.toHaveBeenCalled()
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = { body: { code: mockedCode } } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    mockedOtpRepository.getOtpByCode.mockResolvedValue({
      user: mockedUser,
      code: mockedCode,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
    } as Otp)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        is_valid: true,
      },
      message: 'Recovery link validated successfully',
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/validate-recovery-link')
  })
})
