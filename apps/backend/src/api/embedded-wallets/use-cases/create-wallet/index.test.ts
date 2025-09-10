import { Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/mocks'
import { TokenValidationRequest } from 'api/core/middlewares/token-validation'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

import { CreateWallet, endpoint } from './index'

vi.mock('interfaces/jwt', () => ({
  generateToken: vi.fn(() => 'mocked-jwt-token'),
}))

const mockedUserRepository = mockUserRepository()
const mockedWebauthnRegistrationHelper = mockWebAuthnRegistration()
const mockedSDPEmbeddedWallets = mockSDPEmbeddedWallets()

const mockedCompleteRegistration = vi.fn()
mockedWebauthnRegistrationHelper.complete = mockedCompleteRegistration

const email = 'test-email@example.com'
const sdpCreateWalletResponse = {
  status: WalletStatus.PROCESSING,
}
const user = userFactory({
  email,
})

const basePayload = {
  email,
  registration_response_json: '{"id":"TestPayload123"}',
  token: 'test-token',
}

let useCase: CreateWallet

describe('CreateWallet', () => {
  it('should export endpoint', () => {
    expect(endpoint).toBe('/register/complete')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateWallet(mockedUserRepository, mockedWebauthnRegistrationHelper, mockedSDPEmbeddedWallets)
  })

  describe('handle', () => {
    it('should create a wallet using SDP', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...user,
        contractAddress: undefined,
        uniqueToken: 'test-token',
      } as User)
      mockedSDPEmbeddedWallets.createWallet.mockResolvedValue(sdpCreateWalletResponse)
      mockedCompleteRegistration.mockResolvedValueOnce({
        passkey: { credentialId: 'test-credential-id', credentialHexPublicKey: 'CBY...MNV' },
      })

      const result = await useCase.handle(basePayload)

      expect(result.data.status).toBe(WalletStatus.PROCESSING)
      expect(result.data.token).toBe('mocked-jwt-token')
      expect(result.message).toBe(useCase.parseResponseMessage(WalletStatus.PROCESSING))
    })

    it('should throw error if user not found', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      expect(mockedCompleteRegistration).not.toHaveBeenCalled()
      expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
    })

    it('should throw error if user already has a wallet', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...user,
        contractAddress: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        uniqueToken: 'test-token',
      } as User)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceConflictedException)
      expect(mockedCompleteRegistration).not.toHaveBeenCalled()
      expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
    })

    it('should throw error if authentication failed', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...user,
        contractAddress: undefined,
        uniqueToken: 'test-token',
      } as User)
      mockedCompleteRegistration.mockResolvedValueOnce(false)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(UnauthorizedException)
      expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
    })

    it('should handle wallet creation errors', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...user,
        contractAddress: undefined,
        uniqueToken: 'test-token',
      } as User)
      mockedCompleteRegistration.mockResolvedValueOnce({
        passkey: { credentialId: 'test-credential-id', credentialHexPublicKey: 'CBY...MNV' },
      })
      mockedSDPEmbeddedWallets.createWallet.mockRejectedValue('string-error')

      await expect(useCase.handle(basePayload)).rejects.toBe('string-error')
    })
  })

  describe('executeHttp', () => {
    it('should call response with correct status and json', async () => {
      const req = {
        body: basePayload,
        validatedInvitation: {
          token: 'test-token',
          email: email,
          status: 'SUCCESS',
        },
      } as unknown as TokenValidationRequest
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...user,
        contractAddress: undefined,
        uniqueToken: 'test-token',
      } as User)
      mockedCompleteRegistration.mockResolvedValueOnce({
        passkey: { credentialId: 'test-credential-id', credentialHexPublicKey: 'CBY...MNV' },
      })
      mockedSDPEmbeddedWallets.createWallet.mockResolvedValue(sdpCreateWalletResponse)

      await useCase.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          status: WalletStatus.PROCESSING,
          token: 'mocked-jwt-token',
        },
        message: useCase.parseResponseMessage(WalletStatus.PROCESSING),
      })
    })

    it('should validate payload and throw on invalid data', async () => {
      const req = {
        body: { email },
        validatedInvitation: {
          token: 'test-token',
          email: 'invalid-email',
          status: 'SUCCESS',
        },
      } as unknown as TokenValidationRequest
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(req, res)).rejects.toThrow()
    })
  })

  it('should throw UnauthorizedException when token does not match user token', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue({
      ...user,
      contractAddress: undefined,
      uniqueToken: 'different-token-123',
    } as User)

    await expect(useCase.handle(basePayload)).rejects.toThrow(UnauthorizedException)
  })

  it('should parse response message correctly', () => {
    expect(useCase.parseResponseMessage(WalletStatus.SUCCESS)).toBe('Wallet created successfully')
    expect(useCase.parseResponseMessage(WalletStatus.PROCESSING)).toBe('Wallet creation is in process')
    expect(useCase.parseResponseMessage(WalletStatus.PENDING)).toBe('Wallet creation is in process')
    expect(useCase.parseResponseMessage(WalletStatus.FAILED)).toBe('Wallet creation failed')
    expect(useCase.parseResponseMessage('UNKNOWN' as WalletStatus)).toBe('Request processed, but status is unknown')
  })
})
