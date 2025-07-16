import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateWallet, endpoint } from './index'
import { Request, Response } from 'express'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'

const mockedUserRepository = mockUserRepository()
const mockedSDPEmbeddedWallets = mockSDPEmbeddedWallets()

const token = 'test-token'
const sdpCreateWalletResponse = {
  status: WalletStatus.PROCESSING,
}
const user = userFactory({
  uniqueToken: token,
})

let useCase: CreateWallet

describe('CreateWallet UseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateWallet(mockedUserRepository, mockedSDPEmbeddedWallets)
  })

  it('should create a wallet using SDP', async () => {
    const payload = {
      token,
      public_key: 'test-public-key',
      credential_id: 'test-credential-id',
    }
    mockedUserRepository.getUserByToken.mockResolvedValue({ ...user, publicKey: undefined } as User)
    mockedSDPEmbeddedWallets.createWallet.mockResolvedValue(sdpCreateWalletResponse)

    const result = await useCase.handle(payload)

    expect(result.data.status).toBe(WalletStatus.PROCESSING)
    expect(result.message).toBe(useCase.parseResponseMessage(WalletStatus.PROCESSING))
  })

  it('should throw error if user not found', async () => {
    mockedUserRepository.getUserByToken.mockResolvedValue(null)

    const payload = { token, public_key: 'test-public-key', credential_id: 'test-credential-id' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
  })

  it('should throw error if user already has a wallet', async () => {
    mockedUserRepository.getUserByToken.mockResolvedValue({
      ...user,
      publicKey: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
    } as User)

    const payload = { token, public_key: 'test-public-key', credential_id: 'test-credential-id' }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceConflictedException)
    expect(mockedSDPEmbeddedWallets.createWallet).not.toHaveBeenCalled()
  })

  it('should handle wallet creation errors', async () => {
    mockedUserRepository.getUserByToken.mockResolvedValue({ ...user, publicKey: undefined } as User)
    mockedSDPEmbeddedWallets.createWallet.mockRejectedValue('string-error')

    const payload = { token, public_key: 'test-public-key', credential_id: 'test-credential-id' }
    await expect(useCase.handle(payload)).rejects.toBe('string-error')
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = {
      body: { token, public_key: 'test-public-key', credential_id: 'test-credential-id' },
    } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

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
      body: { token }, // Missing required fields
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
    expect(endpoint).toBe('/')
  })
})
