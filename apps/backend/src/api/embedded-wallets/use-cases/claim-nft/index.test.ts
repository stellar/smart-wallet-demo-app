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
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'
import { mockWalletBackend } from 'interfaces/wallet-backend/mock'
import { mockWebauthnChallenge } from 'interfaces/webauthn-challenge/mock'

import { RequestSchemaT, ResponseSchemaT } from './types'

import { ClaimNft, endpoint } from './index'

// Mock the submitTx helper
vi.mock('api/core/helpers/submit-tx', () => ({
  submitTx: vi.fn(),
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
const mockedWebauthnChallenge = mockWebauthnChallenge()

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

    // Mock Challenge
    mockedWebauthnChallenge.getChallenge.mockReturnValue(null)

    // Mock the submitTx helper
    const { submitTx } = await import('api/core/helpers/submit-tx')
    vi.mocked(submitTx).mockResolvedValue(mockTxResponse)

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
      mockTransactionSigner,
      mockedWebauthnChallenge
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
      const userWithoutWallet = { ...mockUser, contractAddress: undefined } as unknown as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutWallet)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if user does not have passkeys', async () => {
      const userWithoutPasskeys = { ...mockUser, passkeys: [] } as unknown as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if NFT supply is not found by resource', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(null)
      mockedNftSupplyRepository.getNftSupplyByContractAndSessionId.mockResolvedValue(null)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should find NFT supply by supply id', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)
      mockedNftSupplyRepository.getNftSupplyById.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        supply_id: 'supply-123',
      }

      const result = await claimNft.handle(payload)

      expect(result).toEqual({
        data: {
          hash: 'mock-tx-hash',
          tokenId: 'mock-token-id',
        },
        message: 'NFT claimed successfully',
      })
      expect(mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId).not.toHaveBeenCalled()
      expect(mockedNftSupplyRepository.getNftSupplyByContractAndSessionId).not.toHaveBeenCalled()
      expect(mockedNftSupplyRepository.getNftSupplyById).toHaveBeenCalledWith('supply-123')
    })

    it('should find NFT supply by contract address if not found by resource', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(null)
      mockedNftSupplyRepository.getNftSupplyByContractAndSessionId.mockResolvedValue(mockNftSupply)

      // Mock the rest of the flow
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

      await claimNft.handle(validPayload)

      expect(mockedNftSupplyRepository.getNftSupplyByContractAndSessionId).toHaveBeenCalledWith(
        'test-resource',
        'session-123'
      )
    })

    it('should throw ResourceNotFoundException if NFT supply is insufficient', async () => {
      const insufficientSupply = { ...mockNftSupply, totalSupply: 50, mintedAmount: 50 }

      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(insufficientSupply as NftSupply)
      mockedNftSupplyRepository.getNftSupplyByContractAndSessionId.mockResolvedValue(null)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if NFT already exists for session', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(mockNft)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if challenge exists', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedWebauthnChallenge.getChallenge.mockResolvedValue({
        challenge: 'mock-challenge',
        expiresAt: Date.now(),
      })

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException and decrement minted amount if transaction execution fails', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        passkeys: [{ credentialId: 'passkey-1' } as Passkey],
      } as unknown as User)

      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(null)
      mockedNftSupplyRepository.incrementMintedAmount.mockResolvedValue({
        ...mockNftSupply,
        mintedAmount: 51,
      } as NftSupply)

      mockedSorobanService.simulateContractOperation.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })

      // Mock failed transaction
      const { submitTx } = await import('api/core/helpers/submit-tx')
      vi.mocked(submitTx).mockResolvedValue({
        ...mockTxResponse,
        status: rpc.Api.GetTransactionStatus.FAILED,
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(claimNft.handle(validPayload)).rejects.toThrow(ResourceNotFoundException)

      expect(mockedNftSupplyRepository.incrementMintedAmount).toHaveBeenCalled()
      expect(mockedNftRepository.createNft).not.toHaveBeenCalled()
      expect(mockedNftSupplyRepository.decrementMintedAmount).toHaveBeenCalled()
    })

    it('should execute successfully and return NFT claim data', async () => {
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

      const result = await claimNft.handle(validPayload)

      expect(result).toEqual({
        data: {
          hash: 'mock-tx-hash',
          tokenId: 'mock-token-id',
        },
        message: 'NFT claimed successfully',
      })
      expect(mockedNftSupplyRepository.decrementMintedAmount).not.toHaveBeenCalled()
    })

    it('should validate input payload', async () => {
      const invalidPayload = { email: 123, session_id: 'session-123', resource: 'test-resource' }
      await expect(claimNft.handle(invalidPayload as unknown as RequestSchemaT)).rejects.toThrow()

      const invalidPayload2 = { email: 'valid-email@test.com' }
      await expect(claimNft.handle(invalidPayload2 as unknown as RequestSchemaT)).rejects.toThrow()
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
