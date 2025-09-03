import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Nft } from 'api/core/entities/nft/types'
import { NftSupply } from 'api/core/entities/nft-supply/types'
import { Passkey } from 'api/core/entities/passkey/types'
import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import NftRepository from 'api/core/services/nft'
import { mockNftRepository } from 'api/core/services/nft/mock'
import NftSupplyRepository from 'api/core/services/nft-supply'
import { mockNftSupplyRepository } from 'api/core/services/nft-supply/mock'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { ZodValidationException } from 'errors/exceptions/zod-validation'

import { RequestSchemaT } from './types'

import { ClaimNftOptions, endpoint } from './index'

// Mock the repositories
const mockedNftRepository = mockNftRepository()

const mockedNftSupplyRepository = mockNftSupplyRepository()

const mockedUserRepository = mockUserRepository()

// Mock the singleton getInstance methods
vi.mock('api/core/services/nft', () => ({
  default: {
    getInstance: vi.fn(() => mockedNftRepository),
  },
}))

vi.mock('api/core/services/nft-supply', () => ({
  default: {
    getInstance: vi.fn(() => mockedNftSupplyRepository),
  },
}))

vi.mock('api/core/services/user', () => ({
  default: {
    getInstance: vi.fn(() => mockedUserRepository),
  },
}))

const mockPasskey = {
  credentialId: 'credential-123',
  credentialPublicKey: new Uint8Array([1, 2, 3]),
  credentialHexPublicKey: 'hex-key',
  webauthnUserId: 'webauthn-user-123',
  counter: 1,
  label: 'Test Passkey',
  deviceType: 'usb' as const,
  backedUp: true,
  user: {} as unknown as User, // Will be set by userFactory
  createdAt: new Date(),
  updatedAt: new Date(),
  hasId: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  softRemove: vi.fn(),
  recover: vi.fn(),
  reload: vi.fn(),
} as unknown as Passkey

const mockUser = userFactory({
  userId: 'user-123',
  email: 'test@example.com',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
  uniqueToken: 'unique-token',
  passkeys: [mockPasskey],
})

const mockNftSupply = {
  nftSupplyId: 'supply-123',
  name: 'Test NFT',
  description: 'A test NFT for testing',
  url: 'https://example.com/nft',
  code: 'TEST',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
  sessionId: 'session-123',
  resource: 'test-resource',
  totalSupply: 100,
  mintedAmount: 50,
  issuer: 'test-issuer',
  nfts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  hasId: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  softRemove: vi.fn(),
  recover: vi.fn(),
  reload: vi.fn(),
} as unknown as NftSupply

const mockResponse = () => {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  return res as Response
}

let claimNftOptions: ClaimNftOptions

describe('ClaimNftOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    claimNftOptions = new ClaimNftOptions(mockedUserRepository, mockedNftRepository, mockedNftSupplyRepository)
  })

  describe('executeHttp', () => {
    it('should throw UnauthorizedException if user email is missing', async () => {
      const req = { userData: {} } as Request
      const res = mockResponse()

      await expect(claimNftOptions.executeHttp(req, res)).rejects.toThrow(UnauthorizedException)
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should execute successfully when user email is provided', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        query: { session_id: 'session-123', resource: 'test-resource' },
      } as unknown as Request
      const res = mockResponse()

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(null)

      await claimNftOptions.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          nft: {
            ...mockNftSupply,
          },
        },
        message: 'Retrieved NFT options successfully',
      })
    })

    it('should handle query parameters correctly', async () => {
      const req = {
        userData: { email: 'test@example.com' },
        query: { session_id: 'session-456', resource: 'another-resource' },
      } as unknown as Request
      const res = mockResponse()

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(null)

      await claimNftOptions.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    })
  })

  describe('handle', () => {
    it('should throw ResourceNotFoundException if user does not exist', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(null)
      const payload: RequestSchemaT = {
        email: 'nonexistent@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com', {
        relations: ['passkeys'],
      })
    })

    it('should throw ResourceNotFoundException if user does not have a wallet', async () => {
      const userWithoutWallet = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: undefined,
        uniqueToken: 'unique-token',
        passkeys: [{ credentialId: 'passkey-123' } as unknown as Passkey],
      })
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutWallet)
      // Ensure NFT supply repository returns null to prevent the function from continuing
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(null)
      mockedNftSupplyRepository.getNftSupplyByContractAndSessionId.mockResolvedValue(null)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith('test@example.com', {
        relations: ['passkeys'],
      })
    })

    it('should throw ResourceNotFoundException if user does not have passkeys', async () => {
      const userWithoutPasskeys = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        uniqueToken: 'unique-token',
        passkeys: [],
      })
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)
      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if NFT supply is not found by resource', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(null)
      mockedNftSupplyRepository.getNftSupplyByContractAndSessionId.mockResolvedValue(null)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'nonexistent-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
      expect(mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId).toHaveBeenCalledWith(
        'nonexistent-resource',
        'session-123'
      )
      expect(mockedNftSupplyRepository.getNftSupplyByContractAndSessionId).toHaveBeenCalledWith(
        'nonexistent-resource',
        'session-123'
      )
    })

    it('should find NFT supply by contract address when not found by resource', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(null)
      mockedNftSupplyRepository.getNftSupplyByContractAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(null)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'contract-address',
      }

      const result = await claimNftOptions.handle(payload)

      expect(result).toEqual({
        data: {
          nft: {
            ...mockNftSupply,
          },
        },
        message: 'Retrieved NFT options successfully',
      })
      expect(mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId).toHaveBeenCalledWith(
        'contract-address',
        'session-123'
      )
      expect(mockedNftSupplyRepository.getNftSupplyByContractAndSessionId).toHaveBeenCalledWith(
        'contract-address',
        'session-123'
      )
    })

    it('should throw ResourceNotFoundException if NFT supply is insufficient', async () => {
      const insufficientSupply = {
        ...mockNftSupply,
        totalSupply: 100,
        mintedAmount: 100, // All NFTs are minted
      } as unknown as NftSupply

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(insufficientSupply)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException if user already owns an NFT for that session', async () => {
      const existingNft = {
        nftId: 'existing-nft-123',
        tokenId: 'token-123',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        user: mockUser,
        nftSupply: mockNftSupply,
        createdAt: new Date(),
        updatedAt: new Date(),
        hasId: vi.fn(),
        save: vi.fn(),
        remove: vi.fn(),
        softRemove: vi.fn(),
        recover: vi.fn(),
        reload: vi.fn(),
      } as unknown as Nft

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(existingNft)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
      expect(mockedNftRepository.getNftByUserAndSessionId).toHaveBeenCalledWith('user-123', 'session-123', {
        includeDeleted: true,
      })
    })

    it('should return NFT options successfully when all conditions are met', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(mockNftSupply)
      mockedNftRepository.getNftByUserAndSessionId.mockResolvedValue(null)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      const result = await claimNftOptions.handle(payload)

      expect(result).toEqual({
        data: {
          nft: {
            ...mockNftSupply,
          },
        },
        message: 'Retrieved NFT options successfully',
      })
    })

    it('should validate input payload and throw ZodValidationException for invalid data', async () => {
      const invalidPayload = {
        email: 123, // Invalid email type
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(invalidPayload as unknown as RequestSchemaT)).rejects.toThrow(
        ZodValidationException
      )
    })

    it('should handle edge case where totalSupply equals mintedAmount', async () => {
      const edgeCaseSupply = {
        ...mockNftSupply,
        totalSupply: 100,
        mintedAmount: 100, // Exactly equal
      } as unknown as NftSupply

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(edgeCaseSupply)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should handle case where mintedAmount is greater than totalSupply', async () => {
      const invalidSupply = {
        ...mockNftSupply,
        totalSupply: 100,
        mintedAmount: 150, // Greater than total supply
      } as unknown as NftSupply

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedNftSupplyRepository.getNftSupplyByResourceAndSessionId.mockResolvedValue(invalidSupply)

      const payload: RequestSchemaT = {
        email: 'test@example.com',
        session_id: 'session-123',
        resource: 'test-resource',
      }

      await expect(claimNftOptions.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })
  })

  describe('constructor', () => {
    it('should use provided repositories when passed', () => {
      const customUserRepository = mockUserRepository()
      const customNftRepository = { ...mockedNftRepository } as unknown as NftRepository
      const customNftSupplyRepository = { ...mockedNftSupplyRepository } as unknown as NftSupplyRepository

      const customClaimNftOptions = new ClaimNftOptions(
        customUserRepository,
        customNftRepository,
        customNftSupplyRepository
      )

      expect(customClaimNftOptions).toBeInstanceOf(ClaimNftOptions)
    })

    it('should use default repositories when none provided', () => {
      const defaultClaimNftOptions = new ClaimNftOptions()

      expect(defaultClaimNftOptions).toBeInstanceOf(ClaimNftOptions)
    })
  })

  describe('endpoint', () => {
    it('should export correct endpoint', () => {
      expect(endpoint).toBe('/nft/claim/options')
    })
  })

  describe('error messages', () => {
    it('should use correct error messages from constants', () => {
      expect(messages.NOT_AUTHORIZED).toBe('You are not authorized to perform this action')
      expect(messages.USER_NOT_FOUND_BY_EMAIL).toBe("We couldn't find an user with that email address")
      expect(messages.USER_DOES_NOT_HAVE_WALLET).toBe('You do not have a wallet linked to your account')
      expect(messages.USER_DOES_NOT_HAVE_PASSKEYS).toBe(
        'You do not have any passkeys registered. Try recovering your wallet'
      )
      expect(messages.NFT_SUPPLY_NOT_FOUND).toBe("We couldn't find any NFT with that resource or collection")
      expect(messages.NFT_SUPPLY_NOT_ENOUGH).toBe('Insufficient NFT supply with that resource or collection')
      expect(messages.NFT_ALREADY_OWNED_BY_USER).toBe('You already have this NFT owned or minted to your account')
    })
  })
})
