import { rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { otpFactory } from 'api/core/entities/otp/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { mockWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/mocks'
import { mockOtpRepository } from 'api/core/services/otp/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { generateToken } from 'interfaces/jwt'
import { mockSorobanService } from 'interfaces/soroban/mock'
import { mockWalletBackend } from 'interfaces/wallet-backend/mock'

import { RecoverWallet, endpoint } from './index'

const mockedOtpRepository = mockOtpRepository()
const mockedWebauthnRegistrationHelper = mockWebAuthnRegistration()
const mockedSorobanService = mockSorobanService()
const mockedWalletBackend = mockWalletBackend()

const mockedHexPublicKey =
  '040102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40'
const mockedUser = userFactory({})
const mockedOtp = otpFactory({ user: mockedUser })

const mockedCompleteRegistration = vi.fn()
const mockedSubmitTx = vi.fn()
mockedWebauthnRegistrationHelper.complete = mockedCompleteRegistration
vi.mock('api/core/helpers/submit-tx', () => ({
  submitTx: () => mockedSubmitTx(),
}))

let useCase: RecoverWallet

describe('RecoverWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new RecoverWallet(
      mockedOtpRepository,
      mockedWebauthnRegistrationHelper,
      mockedSorobanService,
      mockedWalletBackend
    )
  })

  it('should recover a wallet', async () => {
    const payload = {
      code: mockedOtp.code,
      registration_response_json: '{"id":"TestPayload123"}',
    }
    mockedOtpRepository.getOtpByCode.mockResolvedValue(mockedOtp)
    mockedCompleteRegistration.mockResolvedValueOnce({
      passkey: { credentialId: 'test-credential-id', credentialHexPublicKey: mockedHexPublicKey },
    })
    mockedSorobanService.simulateContractOperation.mockResolvedValue({
      tx: { hash: 'test-tx-hash' } as unknown as Transaction,
      simulationResponse: { id: 'simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
    })

    const result = await useCase.handle(payload)

    expect(result.data.token).toBe(generateToken(mockedUser.userId, mockedUser.email))
    expect(result.message).toBe('Wallet recovery completed successfully')
  })

  it('should throw error if user not found', async () => {
    mockedOtpRepository.getOtpByCode.mockResolvedValue(null)

    const payload = { code: mockedOtp.code, registration_response_json: '{"id":"TestPayload123"}' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedCompleteRegistration).not.toHaveBeenCalled()
  })

  it('should throw error if authentication failed', async () => {
    mockedOtpRepository.getOtpByCode.mockResolvedValue(mockedOtp)
    mockedCompleteRegistration.mockResolvedValueOnce(false)

    const payload = { code: mockedOtp.code, registration_response_json: '{"id":"TestPayload123"}' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = {
      body: { code: mockedOtp.code, registration_response_json: '{"id":"TestPayload123"}' },
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    mockedCompleteRegistration.mockResolvedValueOnce({
      passkey: { credentialId: 'test-credential-id', credentialHexPublicKey: mockedHexPublicKey },
    })
    mockedSorobanService.simulateContractOperation.mockResolvedValue({
      tx: { hash: 'test-tx-hash' } as unknown as Transaction,
      simulationResponse: { id: 'simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
    })

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        token: generateToken(mockedUser.userId, mockedUser.email),
      },
      message: 'Wallet recovery completed successfully',
    })
  })

  it('should validate payload and throw on invalid data', async () => {
    const req = {
      body: { invalid: 'invalid' }, // Missing required fields
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    await expect(useCase.executeHttp(req, res)).rejects.toThrow()
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/recover/complete')
  })
})
