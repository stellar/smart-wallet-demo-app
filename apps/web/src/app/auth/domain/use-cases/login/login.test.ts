import { mockAuthService } from 'src/app/auth/services/auth/mocks'
import { mockWebauthnService } from 'src/app/auth/services/webauthn/mocks'
import { WebAuthnAuthenticateWithPasskeyResult } from 'src/app/auth/services/webauthn/types'

import { LogInUseCase } from './index'

const mockPostLoginResult = {
  // Mocked token with email field (your@email.com)
  data: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ5b3VyQGVtYWlsLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.ejDGXXyQ2cEpHOlxs_MhKP3fFWtu7TKg7VkXP00koes',
  },
  message: 'Completed log in successfully',
}

const mockedAuthService = mockAuthService()
const mockedWebauthnService = mockWebauthnService()

describe('LogInUseCase', () => {
  let logInUseCase: LogInUseCase

  beforeEach(() => {
    vi.resetAllMocks()
    logInUseCase = new LogInUseCase(mockedAuthService, mockedWebauthnService)
  })

  it('should call getLogInOptions with email', async () => {
    const email = 'test@example.com'
    const logInOptions = {
      data: { options_json: '{}' },
      message: 'Retrieved log in options successfully',
    }

    mockedAuthService.getLogInOptions.mockResolvedValue(logInOptions)
    mockedWebauthnService.authenticateWithPasskey.mockResolvedValue({
      rawResponse: 'mock-raw-response',
    } as unknown as WebAuthnAuthenticateWithPasskeyResult)
    mockedAuthService.postLogIn.mockResolvedValue(mockPostLoginResult)

    await logInUseCase.handle({ email })

    expect(mockedAuthService.getLogInOptions).toHaveBeenCalledTimes(1)
    expect(mockedAuthService.getLogInOptions).toHaveBeenCalledWith({ email })
  })

  it('should call authenticateWithPasskey with parsed options', async () => {
    const email = 'test@example.com'
    const logInOptions = {
      data: { options_json: '{"test":"option"}' },
      message: 'Retrieved log in options successfully',
    }
    const parsedOptions = JSON.parse(logInOptions.data.options_json)

    mockedAuthService.getLogInOptions.mockResolvedValue(logInOptions)
    mockedWebauthnService.authenticateWithPasskey.mockResolvedValue({
      rawResponse: 'mock-raw-response',
    } as unknown as WebAuthnAuthenticateWithPasskeyResult)
    mockedAuthService.postLogIn.mockResolvedValue(mockPostLoginResult)

    await logInUseCase.handle({ email })

    expect(mockedWebauthnService.authenticateWithPasskey).toHaveBeenCalledTimes(1)
    expect(mockedWebauthnService.authenticateWithPasskey).toHaveBeenCalledWith({ optionsJSON: parsedOptions })
  })

  it('should throw error if getLogInOptions fails', async () => {
    const email = 'test@example.com'
    const error = new Error('Test error')

    mockedAuthService.getLogInOptions.mockRejectedValue(error)

    await expect(logInUseCase.handle({ email })).rejects.toThrow(error)
  })

  it('should throw error if authenticateWithPasskey fails', async () => {
    const email = 'test@example.com'
    const logInOptions = {
      data: { options_json: '{}' },
      message: 'Retrieved log in options successfully',
    }
    const error = new Error('Test error')

    mockedAuthService.getLogInOptions.mockResolvedValue(logInOptions)
    mockedWebauthnService.authenticateWithPasskey.mockRejectedValue(error)

    await expect(logInUseCase.handle({ email })).rejects.toThrow(error)
  })
})
