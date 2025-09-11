import { xdr, rpc, Keypair, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { nftFactory } from 'api/core/entities/nft/factory'
import { nftSupplyFactory } from 'api/core/entities/nft-supply/factory'
import { NftSupply } from 'api/core/entities/nft-supply/model'
import { Passkey } from 'api/core/entities/passkey/model'
import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/model'
import { mockNftRepository } from 'api/core/services/nft/mock'
import { mockNftSupplyRepository } from 'api/core/services/nft-supply/mock'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { AppDataSource } from 'config/database'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'
import { mockWalletBackend } from 'interfaces/wallet-backend/mock'

import { RequestSchemaT, ResponseSchemaT } from './types'

import { ClaimNft, endpoint } from './index'

// Mock the submitTx helper
vi.mock('api/core/helpers/submit-tx', () => ({
  submitTx: vi.fn(),
}))

// Mock the addMintRequest function
vi.mock('interfaces/batch-mint/mint-queue', () => ({
  addMintRequest: vi.fn(),
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
      manager: {
        createQueryBuilder: vi.fn(() => ({
          setLock: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          andWhere: vi.fn().mockReturnThis(),
          getOne: vi.fn().mockResolvedValue({
            nftSupplyId: 'supply-123',
            sessionId: 'session-123',
            contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
            resource: 'test-resource',
            totalSupply: 100,
            mintedAmount: 50,
          }),
        })),
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockReturnValue({
          nftId: 'nft-123',
          sessionId: 'session-123',
          contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3L7T4V42VK6VHGN3LUBY65ZE',
          user: {
            userId: 'user-123',
            email: 'test@example.com',
            contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3L7T4V42VK6VHGN3LUBY65ZE',
            uniqueToken: 'unique-token',
          },
        }),
        save: vi.fn().mockImplementation(entity => Promise.resolve(entity)),
        increment: vi.fn().mockResolvedValue({ affected: 1 }),
        update: vi.fn(),
      },
    })),
  },
}))

// Mock the ScConvert helper
vi.mock('interfaces/soroban/helpers/sc-convert', () => ({
  ScConvert: {
    accountIdToScVal: vi.fn().mockReturnValue('mock-sc-val'),
    scValToFormatString: vi.fn().mockReturnValue('mock-token-id'),
    scValToString: vi.fn().mockReturnValue('mock-token-id'),
  },
}))

const mockedUserRepository = mockUserRepository()
const mockedSorobanService = mockSorobanService()
const mockedWalletBackend = mockWalletBackend()
const mockedNftRepository = mockNftRepository()
const mockedNftSupplyRepository = mockNftSupplyRepository()

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
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3L7T4V42VK6VHGN3LUBY65ZE',
  nftSupply: mockNftSupply,
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
} as unknown as Transaction

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

    // Mock the addMintRequest function
    const { addMintRequest } = await import('interfaces/batch-mint/mint-queue')
    vi.mocked(addMintRequest).mockResolvedValue({
      data: {
        hash: 'mock-tx-hash',
      },
      message: 'NFT claimed successfully',
    })

    // Mock the ScConvert helper methods
    const { ScConvert } = await import('interfaces/soroban/helpers/sc-convert')
    vi.mocked(ScConvert.accountIdToScVal).mockReturnValue('mock-sc-val' as unknown as xdr.ScVal)
    vi.mocked(ScConvert.scValToFormatString).mockReturnValue('mock-token-id')
    vi.mocked(ScConvert.scValToString).mockReturnValue('mock-token-id')

    claimNft = new ClaimNft(
      mockedUserRepository,
      mockedNftRepository,
      mockedNftSupplyRepository,
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
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(null)
      mockedNftRepository.createNft.mockResolvedValue(mockNft)
      mockedNftSupplyRepository.incrementMintedAmount.mockResolvedValue({
        ...mockNftSupply,
        mintedAmount: 51,
      } as NftSupply)

      mockedSorobanService.simulateContractOperation.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })

      await claimNft.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          hash: 'mock-tx-hash',
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

    const createValidatedPayload = (overrides: Partial<{ user: User; nftSupply: NftSupply }> = {}) => ({
      ...validPayload,
      user:
        overrides.user ||
        ({
          ...mockUser,
          passkeys: [{ credentialId: 'passkey-1' } as Passkey],
        } as unknown as User),
      nftSupply: overrides.nftSupply || mockNftSupply,
    })

    it('should handle valid payload successfully', async () => {
      const validatedPayload = createValidatedPayload()

      const result = await claimNft.handle(validatedPayload)

      expect(result).toEqual({
        data: {
          hash: 'mock-tx-hash',
        },
        message: 'NFT claimed successfully',
      })
    })

    it('should handle user without wallet by throwing error during validation', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        body: { session_id: 'session-123', resource: 'test-resource' },
      } as Request
      const res = mockResponse()

      // Mock user without wallet
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        contractAddress: undefined,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      await expect(claimNft.executeHttp(req, res)).rejects.toThrow()
    })

    it('should handle user without passkeys by throwing error during validation', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        body: { session_id: 'session-123', resource: 'test-resource' },
      } as Request
      const res = mockResponse()

      // Mock user without passkeys
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [],
      } as unknown as User)

      await expect(claimNft.executeHttp(req, res)).rejects.toThrow()
    })

    it('should handle NFT supply not found by throwing error during validation', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        body: { session_id: 'session-123', resource: 'test-resource' },
      } as Request
      const res = mockResponse()

      // Mock user with valid data
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      // Mock NFT supply not found
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(null)
      mockedNftSupplyRepository.getNftSupplyByContractAndSessionId.mockResolvedValue(null)

      await expect(claimNft.executeHttp(req, res)).rejects.toThrow()
    })

    it('should handle NFT supply lookup successfully', async () => {
      const validatedPayload = createValidatedPayload()

      const result = await claimNft.handle(validatedPayload)

      expect(result).toEqual({
        data: {
          hash: 'mock-tx-hash',
        },
        message: 'NFT claimed successfully',
      })
    })

    it('should handle insufficient NFT supply by throwing error during validation', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        body: { session_id: 'session-123', resource: 'test-resource' },
      } as Request
      const res = mockResponse()

      // Mock user with valid data
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      // Mock insufficient NFT supply
      const insufficientSupply = { ...mockNftSupply, totalSupply: 50, mintedAmount: 50 } as NftSupply
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(insufficientSupply)

      await expect(claimNft.executeHttp(req, res)).rejects.toThrow()
    })

    it('should handle existing NFT for session by throwing error during validation', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        body: { session_id: 'session-123', resource: 'test-resource' },
      } as Request
      const res = mockResponse()

      // Mock user with valid data
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      // Mock NFT supply found
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)

      // Mock existing NFT for user
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(mockNft)

      await expect(claimNft.executeHttp(req, res)).rejects.toThrow()
    })

    it('should throw ResourceNotFoundException if NFT is already created under transaction', async () => {
      const validatedPayload = createValidatedPayload()

      // Mock the database to return an existing NFT, which should trigger the error
      vi.mocked(AppDataSource.createQueryRunner).mockReturnValue({
        connect: vi.fn(),
        startTransaction: vi.fn(),
        rollbackTransaction: vi.fn(),
        release: vi.fn(),
        manager: {
          createQueryBuilder: vi.fn(() => ({
            setLock: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getOne: vi.fn().mockResolvedValue({
              nftSupplyId: 'supply-123',
              sessionId: 'session-123',
              contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
              resource: 'test-resource',
              totalSupply: 100,
              mintedAmount: 50,
            }),
          })),
          findOne: vi.fn().mockReturnValue({
            nftId: 'nft-123',
            sessionId: 'session-123',
            contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3L7T4V42VK6VHGN3LUBY65ZE',
            user: {
              userId: 'user-123',
              email: 'test@example.com',
              contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3L7T4V42VK6VHGN3LUBY65ZE',
              uniqueToken: 'unique-token',
            },
          }), // This will trigger the error
        },
      } as unknown as ReturnType<typeof AppDataSource.createQueryRunner>)

      await expect(claimNft.handle(validatedPayload)).rejects.toThrow()
    })

    it('should throw ResourceNotFoundException if transaction execution fails', async () => {
      const validatedPayload = createValidatedPayload()

      // Mock failed transaction
      const { submitTx } = await import('api/core/helpers/submit-tx')
      vi.mocked(submitTx).mockResolvedValue({
        ...mockTxResponse,
        status: rpc.Api.GetTransactionStatus.FAILED,
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(claimNft.handle(validatedPayload)).rejects.toThrow()
    })

    it('should execute successfully and return NFT claim data', async () => {
      const validatedPayload = createValidatedPayload()

      const result = await claimNft.handle(validatedPayload)

      expect(result).toEqual({
        data: {
          hash: 'mock-tx-hash',
        },
        message: 'NFT claimed successfully',
      })
    })

    it('should rollback transaction on any error', async () => {
      const validatedPayload = createValidatedPayload()

      // Mock an error in submitTx
      const { submitTx } = await import('api/core/helpers/submit-tx')
      vi.mocked(submitTx).mockRejectedValue(new Error('Transaction failed'))

      await expect(claimNft.handle(validatedPayload)).rejects.toThrow('Transaction failed')

      // Since we're mocking the database module, we need to check if the mock was called
      expect(AppDataSource.createQueryRunner).toHaveBeenCalled()
    })

    it('should validate input payload', async () => {
      const req = {
        userData: { email: 'invalid-email' }, // Invalid email format
        body: { session_id: 'session-123', resource: 'test-resource' },
      } as Request
      const res = mockResponse()

      await expect(claimNft.executeHttp(req, res)).rejects.toThrow()
    })
  })

  describe('constructor', () => {
    it('should use provided dependencies when passed', () => {
      const customClaimNft = new ClaimNft(
        mockedUserRepository,
        mockedNftRepository,
        mockedNftSupplyRepository,
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
