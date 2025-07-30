import { mockAuthService } from 'src/app/auth/services/auth/mocks'
import { mockWebauthnService } from 'src/app/auth/services/webauthn/mocks'
import { WebAuthnCreatePasskeyResult } from 'src/app/auth/services/webauthn/types'

import { CreateWalletUseCase } from './index'

const mockPostRegisterResult = {
  // Mocked token with email field (your@email.com)
  data: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ5b3VyQGVtYWlsLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.ejDGXXyQ2cEpHOlxs_MhKP3fFWtu7TKg7VkXP00koes',
    success: true,
  },
  message: 'Completed registration successfully',
}

const mockedAuthService = mockAuthService()
const mockedWebauthnService = mockWebauthnService()

describe('CreateWalletUseCase', () => {
  let createWalletUseCase: CreateWalletUseCase

  beforeEach(() => {
    vi.resetAllMocks()
    createWalletUseCase = new CreateWalletUseCase(mockedAuthService, mockedWebauthnService)
  })

  it('should call getRegisterOptions with email', async () => {
    const email = 'test@example.com'
    const registerOptions = {
      data: { options_json: '{}', success: true },
      message: 'Retrieved register options successfully',
    }

    mockedAuthService.getRegisterOptions.mockResolvedValue(registerOptions)
    mockedWebauthnService.createPasskey.mockResolvedValue({
      rawResponse: 'mock-raw-response',
    } as unknown as WebAuthnCreatePasskeyResult)
    mockedAuthService.postRegister.mockResolvedValue(mockPostRegisterResult)

    await createWalletUseCase.handle({ email })

    expect(mockedAuthService.getRegisterOptions).toHaveBeenCalledTimes(1)
    expect(mockedAuthService.getRegisterOptions).toHaveBeenCalledWith({ email })
  })

  it('should call createPasskey with parsed options', async () => {
    const email = 'test@example.com'
    const registerOptions = {
      data: { options_json: '{"test":"option"}', success: true },
      message: 'Retrieved register options successfully',
    }
    const parsedOptions = JSON.parse(registerOptions.data.options_json)

    mockedAuthService.getRegisterOptions.mockResolvedValue(registerOptions)
    mockedWebauthnService.createPasskey.mockResolvedValue({
      rawResponse: 'mock-raw-response',
    } as unknown as WebAuthnCreatePasskeyResult)
    mockedAuthService.postRegister.mockResolvedValue(mockPostRegisterResult)

    await createWalletUseCase.handle({ email })

    expect(mockedWebauthnService.createPasskey).toHaveBeenCalledTimes(1)
    expect(mockedWebauthnService.createPasskey).toHaveBeenCalledWith({ optionsJSON: parsedOptions })
  })

  it('should call postRegister with email and registration response', async () => {
    const email = 'test@example.com'
    const registerOptions = {
      data: { options_json: '{}', success: true },
      message: 'Retrieved register options successfully',
    }
    const createPasskeyResponse = {
      rawResponse: 'mock-raw-response',
    } as unknown as WebAuthnCreatePasskeyResult

    mockedAuthService.getRegisterOptions.mockResolvedValue(registerOptions)
    mockedWebauthnService.createPasskey.mockResolvedValue(createPasskeyResponse)
    mockedAuthService.postRegister.mockResolvedValue(mockPostRegisterResult)

    await createWalletUseCase.handle({ email })

    expect(mockedAuthService.postRegister).toHaveBeenCalledTimes(1)
    expect(mockedAuthService.postRegister).toHaveBeenCalledWith({
      email,
      registrationResponseJSON: JSON.stringify(createPasskeyResponse.rawResponse),
    })
  })

  it('should throw error if getRegisterOptions fails', async () => {
    const email = 'test@example.com'
    const error = new Error('Test error')

    mockedAuthService.getRegisterOptions.mockRejectedValue(error)

    await expect(createWalletUseCase.handle({ email })).rejects.toThrow(error)
  })

  it('should throw error if createPasskey fails', async () => {
    const email = 'test@example.com'
    const registerOptions = {
      data: { options_json: '{}', success: true },
      message: 'Retrieved register options successfully',
    }
    const error = new Error('Test error')

    mockedAuthService.getRegisterOptions.mockResolvedValue(registerOptions)
    mockedWebauthnService.createPasskey.mockRejectedValue(error)

    await expect(createWalletUseCase.handle({ email })).rejects.toThrow(error)
  })
})
