import { Request, Response } from 'express'

import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockPasskeyRepository } from 'api/core/services/passkey/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'

import { CreateWallet, endpoint } from './index'

const mockedUserRepository = mockUserRepository()
const mockedPasskeyRepository = mockPasskeyRepository()
const mockedWebauthnChallenge = mockWebauthnChallenge()
const mockedSDPEmbeddedWallets = mockSDPEmbeddedWallets()

const mockedCompleteRegistration = vi.fn()
vi.mock('api/core/helpers/webauthn/registration/complete-registration', () => ({
  completeRegistration: () => mockedCompleteRegistration(),
}))

const email = 'test-email@example.com'
const sdpCreateWalletResponse = {
  status: WalletStatus.PROCESSING,
}
const user = userFactory({
  email: email,
})

let useCase: CreateWallet

describe('CreateWallet UseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateWallet(
      mockedUserRepository,
      mockedPasskeyRepository,
      mockedWebauthnChallenge,
      mockedSDPEmbeddedWallets
    )
  })

  it('should create a wallet using SDP', async () => {
    const payload = {
      email,
      registration_response_json: '{"id":"TestPayload123"}',
    }
    mockedUserRepository.getUserByEmail.mockResolvedValue({ ...user, contractAddress: undefined } as User)
    mockedSDPEmbeddedWallets.createWallet.mockResolvedValue(sdpCreateWalletResponse)
    mockedCompleteRegistration.mockResolvedValueOnce({
      passkey: { credentialId: 'test-credential-id' },
      publicKeyHex: 'CBY...MNV',
    })

    const result = await useCase.handle(payload)

    expect(result.data.status).toBe(WalletStatus.PROCESSING)
    expect(result.message).toBe(useCase.parseResponseMessage(WalletStatus.PROCESSING))
  })

  it('should throw error if user not found', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue(null)

    const payload = { email, registration_response_json: '{"id":"TestPayload123"}' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedCompleteRegistration).not.toHaveBeenCalled()
    expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
  })

  it('should throw error if user already has a wallet', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue({
      ...user,
      contractAddress: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
    } as User)

    const payload = { email, registration_response_json: '{"id":"TestPayload123"}' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceConflictedException)
    expect(mockedCompleteRegistration).not.toHaveBeenCalled()
    expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
  })

  it('should throw error if authentication failed', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue({ ...user, contractAddress: undefined } as User)
    mockedCompleteRegistration.mockResolvedValueOnce(false)

    const payload = { email, registration_response_json: '{"id":"TestPayload123"}' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(UnauthorizedException)
    expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
  })

  it('should throw error if authentication pass but publicKeyHex is missing', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue({ ...user, contractAddress: undefined } as User)
    mockedCompleteRegistration.mockResolvedValueOnce({
      passkey: { credentialId: 'test-credential-id' },
      publicKeyHex: undefined,
    })

    const payload = { email, registration_response_json: '{"id":"TestPayload123"}' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
  })

  it('should handle wallet creation errors', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue({ ...user, contractAddress: undefined } as User)
    mockedCompleteRegistration.mockResolvedValueOnce({
      passkey: { credentialId: 'test-credential-id' },
      publicKeyHex: 'CBY...MNV',
    })
    mockedSDPEmbeddedWallets.createWallet.mockRejectedValue('string-error')

    const payload = { email, registration_response_json: '{"id":"TestPayload123"}' }
    await expect(useCase.handle(payload)).rejects.toBe('string-error')
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = {
      body: { email, registration_response_json: '{"id":"TestPayload123"}' },
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    mockedCompleteRegistration.mockResolvedValueOnce({
      passkey: { credentialId: 'test-credential-id' },
      publicKeyHex: 'CBY...MNV',
    })
    mockedSDPEmbeddedWallets.createWallet.mockResolvedValue(sdpCreateWalletResponse)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        status: WalletStatus.PROCESSING,
      },
      message: useCase.parseResponseMessage(WalletStatus.PROCESSING),
    })
  })

  it('should validate payload and throw on invalid data', async () => {
    const req = {
      body: { email }, // Missing required fields
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    await expect(useCase.executeHttp(req, res)).rejects.toThrow()
  })

  it('should parse response message correctly', () => {
    expect(useCase.parseResponseMessage(WalletStatus.SUCCESS)).toBe('Wallet created successfully')
    expect(useCase.parseResponseMessage(WalletStatus.PROCESSING)).toBe('Wallet creation is in process')
    expect(useCase.parseResponseMessage(WalletStatus.PENDING)).toBe('Wallet creation is in process')
    expect(useCase.parseResponseMessage(WalletStatus.FAILED)).toBe('Wallet creation failed')
    expect(useCase.parseResponseMessage('UNKNOWN' as WalletStatus)).toBe('Request processed, but status is unknown')
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/register/complete')
  })
})
