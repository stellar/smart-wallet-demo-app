import { Otp } from 'api/core/entities/otp/types'
import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockOtpRepository } from 'api/core/services/otp/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { mockEmailService } from 'interfaces/email-provider/mock'

import { RequestSchemaT } from './types'

import { GenerateRecoveryLink } from '.'

const mockedOtpRepository = mockOtpRepository()
const mockedUserRepository = mockUserRepository()
const mockedEmailService = mockEmailService()

const mockedEmail = 'test@example.com'
const mockedUser = userFactory({ userId: 'user-123', email: mockedEmail })

let useCase: GenerateRecoveryLink

describe('GenerateRecoveryLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GenerateRecoveryLink(
      mockedUserRepository,
      mockedOtpRepository,
      mockedEmailService,
      'http://example.com/recovery'
    )
  })

  it('should generate a recovery link', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue(mockedUser)
    mockedOtpRepository.createOtp.mockResolvedValue({
      code: 'ABC123',
      expiresAt: new Date(),
    } as Otp)
    mockedEmailService.sendEmail.mockResolvedValue()

    const result = await useCase.handle({ email: mockedEmail })

    expect(result.data.email_sent).toBeTruthy()
  })

  it('should throw an error if user is not found', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue(null)

    await expect(useCase.handle({ email: mockedEmail })).rejects.toThrow(ResourceNotFoundException)
    expect(mockedOtpRepository.createOtp).not.toHaveBeenCalled()
    expect(mockedEmailService.sendEmail).not.toHaveBeenCalled()
  })

  it('should thrown an error if user does not have a wallet', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue({
      ...mockedUser,
      contractAddress: undefined, // Simulating no wallet
    } as User)

    await expect(useCase.handle({ email: mockedEmail })).rejects.toThrow(BadRequestException)
    expect(mockedOtpRepository.createOtp).not.toHaveBeenCalled()
    expect(mockedEmailService.sendEmail).not.toHaveBeenCalled()
  })

  it('should thrown an error if user already has an active OTP', async () => {
    const activeOtp = { expiresAt: new Date(Date.now() + 1000 * 60 * 5) } as Otp
    mockedUserRepository.getUserByEmail.mockResolvedValue({
      ...mockedUser,
      otps: [activeOtp], // Simulating an active OTP
    } as User)

    await expect(useCase.handle({ email: mockedEmail })).rejects.toThrow(ResourceConflictedException)
    expect(mockedOtpRepository.createOtp).not.toHaveBeenCalled()
    expect(mockedEmailService.sendEmail).not.toHaveBeenCalled()
  })

  it('should thrown an error if payload is invalid', async () => {
    await expect(useCase.handle({ invalid: 'invalid' } as unknown as RequestSchemaT)).rejects.toThrowError()
    expect(mockedUserRepository.getUserByEmail).not.toHaveBeenCalled()
    expect(mockedOtpRepository.createOtp).not.toHaveBeenCalled()
    expect(mockedEmailService.sendEmail).not.toHaveBeenCalled()
  })

  it('should send email with correct data', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue(mockedUser)
    mockedOtpRepository.createOtp.mockResolvedValue({
      code: 'ABC123',
      expiresAt: new Date(),
    } as Otp)

    await useCase.handle({ email: mockedEmail })

    expect(useCase.prepareEmailData(mockedEmail, 'ABC123')).toEqual({
      to: mockedEmail,
      subject: 'Recovery Link',
      text: 'This is your recovery link: http://example.com/recovery?code=ABC123',
      html: '<p>Click on the following link to recover your wallet: <a href="http://example.com/recovery?code=ABC123">http://example.com/recovery?code=ABC123</a></p>',
    })
    expect(mockedEmailService.sendEmail).toHaveBeenCalledWith({
      to: mockedEmail,
      subject: 'Recovery Link',
      text: expect.stringContaining('This is your recovery link: http://example.com/recovery?code=ABC123'),
      html: expect.stringContaining('<a href="http://example.com/recovery?code=ABC123">'),
    })
  })
})
