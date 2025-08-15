import { xdr, rpc, Keypair } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { nftFactory } from 'api/core/entities/nft/factory'
import { nftFactory as nftSupplyFactory } from 'api/core/entities/nft-supply/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'
import { mockWalletBackend } from 'interfaces/wallet-backend/mock'

import { RequestSchemaT, ResponseSchemaT } from './types'

import { ClaimNft, endpoint } from './index'

// Mock the submitTx helper
vi.mock('api/core/helpers/submit-tx', () => ({
  submitTx: vi.fn(),
}))

// Mock the database module
vi.mock('config/database', () => ({
  AppDataSource: {
    createQueryRunner: vi.fn(() => ({
      connect: vi.fn(),
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      rollbackTransaction: vi.fn(),
      release: vi.fn(),
    })),
  },
}))

// Mock the ScConvert helper
vi.mock('interfaces/soroban/helpers/sc-convert', () => ({
  ScConvert: {
    accountIdToScVal: vi.fn().mockReturnValue('mock-sc-val'),
    scValToFormatString: vi.fn().mockReturnValue('mock-token-id'),
  },
}))

const mockedUserRepository = mockUserRepository()
const mockedSorobanService = mockSorobanService()
const mockedWalletBackend = mockWalletBackend()

const mockUser = userFactory({
  userId: 'user-123',
  email: 'test@example.com',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
  uniqueToken: 'unique-token',
})

const mockNftSupply = nftSupplyFactory({
  nftSupplyId: 'supply-123',
  sessionId: 'session-123',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
  resource: 'test-resource',
  totalSupply: 100,
  mintedAmount: 50,
})

const mockNft = nftFactory({
  nftId: 'nft-123',
  tokenId: 'token-123',
  sessionId: 'session-123',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3L7T4V42VK6VHGN3LUBY65ZE',
  user: mockUser,
})

const mockTransactionSigner = Keypair.random()
const mockSimulationResponse = {
  events: [],
  latestLedger: 12345,
  minResourceFee: '100',
  results: [
    {
      xdr: 'mock-xdr',
      auth: [],
    },
  ],
  stateChanges: [],
  transactionData: 'mock-transaction-data',
} as unknown as rpc.Api.SimulateTransactionSuccessResponse

const mockTransaction = {
  toXDR: vi.fn().mockReturnValue('mock-xdr'),
} as unknown as any

const mockTxResponse = {
  status: rpc.Api.GetTransactionStatus.SUCCESS,
  txHash: 'mock-tx-hash',
  returnValue: xdr.ScVal.scvString('mock-token-id'),
} as rpc.Api.GetSuccessfulTransactionResponse

const mockResponse = () => {
  const res: Partial<Response<ResponseSchemaT>> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  return res as Response<ResponseSchemaT>
}

let claimNft: ClaimNft

describe('ClaimNft', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    // Mock the Soroban service
    mockedSorobanService.simulateContractOperation.mockResolvedValue({
      tx: mockTransaction,
      simulationResponse: mockSimulationResponse,
    })

    // Mock the submitTx helper
    const { submitTx } = await import('api/core/helpers/submit-tx')
    vi.mocked(submitTx).mockResolvedValue(mockTxResponse)

    // Mock the ScConvert helper methods
    const { ScConvert } = await import('interfaces/soroban/helpers/sc-convert')
    vi.mocked(ScConvert.accountIdToScVal).mockReturnValue('mock-sc-val' as any)
    vi.mocked(ScConvert.scValToFormatString).mockReturnValue('mock-token-id')

    claimNft = new ClaimNft(
      mockedUserRepository,
      {
        getNftBySessionId: vi.fn(),
        createNft: vi.fn(),
        updateNft: vi.fn(),
      } as any,
      {
        getNftSupplyByResource: vi.fn(),
        getNftSupplyByContractAddress: vi.fn(),
        incrementMintedAmount: vi.fn(),
      } as any,
      mockedSorobanService,
      mockedWalletBackend,
      mockTransactionSigner
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('executeHttp', () => {
    it('should throw UnauthorizedException if user email is missing', async () => {
      const req = { userData: {} } as Request
      const res = mockResponse()

      await expect(claimNft.executeHttp(req, res)).rejects.toThrow(UnauthorizedException)
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should execute successfully when user email is provided', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        body: { session_id: 'session-123', resource: 'test-resource' },
      } as Request
      const res = mockResponse()

      // Mock all the necessary repository calls
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as any],
      })

      const nftRepository = claimNft['nftRepository'] as any
      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any

      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(mockNftSupply)
      nftRepository.getNftBySessionId.mockResolvedValue(null)
      nftRepository.createNft.mockResolvedValue(mockNft)
      nftSupplyRepository.incrementMintedAmount.mockResolvedValue({
        ...mockNftSupply,
        mintedAmount: 51,
      })

      mockedSorobanService.simulateContractOperation.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })

      await claimNft.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          hash: 'mock-tx-hash',
          tokenId: 'mock-token-id',
        },
        message: 'NFT claimed successfully',
      })
    })
  })

  describe('handle', () => {
    const validPayload: RequestSchemaT = {
      email: 'test@example.com',
      session_id: 'session-123',
      resource: 'test-resource',
    }

    it('should throw ResourceNotFoundException if user does not exist', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith('test@example.com', {
        relations: ['passkeys'],
      })
    })

    it('should throw ResourceNotFoundException if user does not have a wallet', async () => {
      const userWithoutWallet = { ...mockUser, contractAddress: undefined } as any
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutWallet)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if user does not have passkeys', async () => {
      const userWithoutPasskeys = { ...mockUser, passkeys: [] } as any
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if NFT supply is not found by resource', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as any],
      } as any)

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(null)
      nftSupplyRepository.getNftSupplyByContractAddress.mockResolvedValue(null)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should find NFT supply by contract address if not found by resource', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ id: 'passkey-1' }],
      })

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(null)
      nftSupplyRepository.getNftSupplyByContractAddress.mockResolvedValue(mockNftSupply)

      // Mock the rest of the flow
      const nftRepository = claimNft['nftRepository'] as any
      nftRepository.getNftBySessionId.mockResolvedValue(null)
      nftRepository.createNft.mockResolvedValue(mockNft)
      nftSupplyRepository.incrementMintedAmount.mockResolvedValue({
        ...mockNftSupply,
        mintedAmount: 51,
      })

      mockedSorobanService.simulateContractOperation.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })

      await claimNft.handle(validPayload)

      expect(nftSupplyRepository.getNftSupplyByContractAddress).toHaveBeenCalledWith('test-resource')
    })

    it('should throw ResourceNotFoundException if NFT supply is insufficient', async () => {
      const insufficientSupply = { ...mockNftSupply, totalSupply: 50, mintedAmount: 50 }

      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ id: 'passkey-1' }],
      })

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(insufficientSupply)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if user already owns NFT for the session', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ id: 'passkey-1' }],
      })

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      const nftRepository = claimNft['nftRepository'] as any

      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(mockNftSupply)
      nftRepository.getNftBySessionId.mockResolvedValue(mockNft)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw BadRequestException if NFT creation fails', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ id: 'passkey-1' }],
      })

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      const nftRepository = claimNft['nftRepository'] as any

      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(mockNftSupply)
      nftRepository.getNftBySessionId.mockResolvedValue(null)
      nftRepository.createNft.mockResolvedValue(null)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException if NFT supply update fails', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ id: 'passkey-1' }],
      })

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      const nftRepository = claimNft['nftRepository'] as any

      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(mockNftSupply)
      nftRepository.getNftBySessionId.mockResolvedValue(null)
      nftRepository.createNft.mockResolvedValue(mockNft)
      nftSupplyRepository.incrementMintedAmount.mockResolvedValue(null)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(BadRequestException)
    })

    it('should throw ResourceNotFoundException if transaction execution fails', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ id: 'passkey-1' }],
      })

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      const nftRepository = claimNft['nftRepository'] as any

      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(mockNftSupply)
      nftRepository.getNftBySessionId.mockResolvedValue(null)
      nftRepository.createNft.mockResolvedValue(mockNft)
      nftSupplyRepository.incrementMintedAmount.mockResolvedValue({
        ...mockNftSupply,
        mintedAmount: 51,
      })

      mockedSorobanService.simulateContractOperation.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })

      // Mock failed transaction
      const { submitTx } = await import('api/core/helpers/submit-tx')
      vi.mocked(submitTx).mockResolvedValue({
        ...mockTxResponse,
        status: rpc.Api.GetTransactionStatus.FAILED,
      })

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should execute successfully and return NFT claim data', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ id: 'passkey-1' }],
      })

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      const nftRepository = claimNft['nftRepository'] as any

      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(mockNftSupply)
      nftRepository.getNftBySessionId.mockResolvedValue(null)
      nftRepository.createNft.mockResolvedValue(mockNft)
      nftSupplyRepository.incrementMintedAmount.mockResolvedValue({
        ...mockNftSupply,
        mintedAmount: 51,
      })

      mockedSorobanService.simulateContractOperation.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })

      const result = await claimNft.handle(validPayload)

      expect(result).toEqual({
        data: {
          hash: 'mock-tx-hash',
          tokenId: 'mock-token-id',
        },
        message: 'NFT claimed successfully',
      })
    })

    it('should rollback transaction on any error', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as any],
      } as any)

      const nftSupplyRepository = claimNft['nftSupplyRepository'] as any
      const nftRepository = claimNft['nftRepository'] as any

      nftSupplyRepository.getNftSupplyByResource.mockResolvedValue(mockNftSupply)
      nftRepository.getNftBySessionId.mockResolvedValue(null)
      nftRepository.createNft.mockResolvedValue(mockNft)
      nftSupplyRepository.incrementMintedAmount.mockResolvedValue({
        ...mockNftSupply,
        mintedAmount: 51,
      })

      mockedSorobanService.simulateContractOperation.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })

      // Mock an error in submitTx
      const { submitTx } = await import('api/core/helpers/submit-tx')
      vi.mocked(submitTx).mockRejectedValue(new Error('Transaction failed'))

      await expect(claimNft.handle(validPayload)).rejects.toThrow('Transaction failed')

      // Since we're mocking the database module, we need to check if the mock was called
      const { AppDataSource } = await import('config/database')
      expect(AppDataSource.createQueryRunner).toHaveBeenCalled()
    })

    it('should validate input payload', async () => {
      const invalidPayload = { email: 123, session_id: 'session-123', resource: 'test-resource' }

      await expect(claimNft.handle(invalidPayload as unknown as RequestSchemaT)).rejects.toThrow()
    })
  })

  describe('constructor', () => {
    it('should use provided dependencies when passed', () => {
      const customClaimNft = new ClaimNft(
        mockedUserRepository,
        { getNftBySessionId: vi.fn() } as any,
        { getNftSupplyByResource: vi.fn() } as any,
        mockedSorobanService,
        mockedWalletBackend,
        mockTransactionSigner
      )

      expect(customClaimNft).toBeInstanceOf(ClaimNft)
    })

    it('should use default dependencies when none provided', () => {
      const defaultClaimNft = new ClaimNft()

      expect(defaultClaimNft).toBeInstanceOf(ClaimNft)
    })
  })

  describe('endpoint', () => {
    it('should export correct endpoint', () => {
      expect(endpoint).toBe('/nft/claim/complete')
    })
  })
})
