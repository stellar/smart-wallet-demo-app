import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Nft } from 'api/core/entities/nft/model'
import { userFactory } from 'api/core/entities/user/factory'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'

import { NftSchemaT, RequestSchemaT } from './types'

import { ListNft, endpoint } from './index'

// No need to mock getTokenData since we're using nftSupply data directly

const mockedUserRepository = mockUserRepository()

const mockUser = userFactory({
  userId: 'user-123',
  email: 'test@example.com',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
  uniqueToken: 'unique-token',
})

const mockNft = {
  nftId: 'nft-123',
  tokenId: 'token-123',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
  transactionHash: 'tx-hash-123',
  user: mockUser,
  nftSupply: {
    code: 'TEST',
    name: 'Test NFT',
    description: 'A test NFT',
    url: 'https://example.com',
    resource: 'test-resource',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
} as Nft

const mockResponse = () => {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  return res as Response
}

let listNft: ListNft

describe('ListNft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listNft = new ListNft(mockedUserRepository)
  })

  describe('executeHttp', () => {
    it('should throw UnauthorizedException if user email is missing', async () => {
      const req = { userData: {} } as Request
      const res = mockResponse()

      await expect(listNft.executeHttp(req, res)).rejects.toThrow(UnauthorizedException)
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should execute successfully when user email is provided', async () => {
      const req = { userData: { email: 'test@example.com' } } as Request
      const res = mockResponse()

      const userWithNfts = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        uniqueToken: 'unique-token',
      })
      userWithNfts.nfts = [mockNft]
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithNfts)

      // No need to mock getTokenData since we're using nftSupply data directly

      await listNft.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            nfts: [
              expect.objectContaining({
                code: 'TEST',
                name: 'Test NFT',
                description: 'A test NFT',
                url: 'https://example.com',
                contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
                resource: 'test-resource',
                token_id: 'token-123',
                transaction_hash: 'tx-hash-123',
              }),
            ],
          },
          message: 'Tokens list retrieved successfully',
        })
      )
    })
  })

  describe('handle', () => {
    it('should throw ResourceNotFoundException if user does not exist', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(null)
      const payload = { email: 'nonexistent@example.com' }

      await expect(listNft.handle(payload)).rejects.toThrow(ResourceNotFoundException)
      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com', {
        relations: ['nfts', 'nfts.nftSupply'],
      })
    })

    it('should return empty array if user does not have a wallet', async () => {
      const userWithoutWallet = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: undefined,
        uniqueToken: 'unique-token',
      })
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutWallet)
      const payload = { email: 'test@example.com' }

      const result = await listNft.handle(payload)

      expect(result).toEqual({
        data: {
          nfts: [],
        },
        message: 'Tokens list retrieved successfully',
      })
    })

    it('should return empty array if user has no NFTs', async () => {
      const userWithNoNfts = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        uniqueToken: 'unique-token',
      })
      userWithNoNfts.nfts = []
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithNoNfts)
      const payload = { email: 'test@example.com' }

      const result = await listNft.handle(payload)

      expect(result).toEqual({
        data: {
          nfts: [],
        },
        message: 'Tokens list retrieved successfully',
      })
    })

    it('should return NFTs with metadata when user has NFTs', async () => {
      const userWithNfts = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        uniqueToken: 'unique-token',
      })
      userWithNfts.nfts = [mockNft]
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithNfts)

      // No need to mock getTokenData since we're using nftSupply data directly

      const payload = { email: 'test@example.com' }

      const result = await listNft.handle(payload)

      expect(result).toEqual(
        expect.objectContaining({
          data: {
            nfts: [
              expect.objectContaining({
                code: 'TEST',
                name: 'Test NFT',
                description: 'A test NFT',
                url: 'https://example.com',
                contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
                resource: 'test-resource',
                token_id: 'token-123',
                transaction_hash: 'tx-hash-123',
              }),
            ],
          },
          message: 'Tokens list retrieved successfully',
        })
      )
    })

    it('should handle multiple NFTs correctly', async () => {
      const mockNft2 = {
        nftId: 'nft-456',
        tokenId: 'token-456',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        transactionHash: 'tx-hash-456',
        user: mockUser,
        nftSupply: {
          code: 'TEST2',
          name: 'Test NFT 2',
          description: 'Second test NFT',
          url: 'https://example.com/2',
          resource: 'test-resource-2',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Nft

      const userWithMultipleNfts = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        uniqueToken: 'unique-token',
      })
      userWithMultipleNfts.nfts = [mockNft, mockNft2]
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithMultipleNfts)

      // No need to mock getTokenData since we're using nftSupply data directly

      const payload = { email: 'test@example.com' }

      const result = await listNft.handle(payload)

      expect(result.data.nfts).toHaveLength(2)
      expect(result.data.nfts[0]).toEqual(
        expect.objectContaining({
          code: 'TEST',
          name: 'Test NFT',
          description: 'A test NFT',
          url: 'https://example.com',
          contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          resource: 'test-resource',
          token_id: 'token-123',
          transaction_hash: 'tx-hash-123',
        })
      )
      expect(result.data.nfts[1]).toEqual(
        expect.objectContaining({
          code: 'TEST2',
          name: 'Test NFT 2',
          description: 'Second test NFT',
          url: 'https://example.com/2',
          contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          resource: 'test-resource-2',
          token_id: 'token-456',
          transaction_hash: 'tx-hash-456',
        })
      )
    })

    it('should handle NFTs with missing metadata gracefully', async () => {
      const mockNftWithMissingMetadata = {
        nftId: 'nft-123',
        tokenId: 'token-123',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        transactionHash: 'tx-hash-123',
        user: mockUser,
        nftSupply: {
          code: 'TEST',
          name: 'Test NFT',
          description: '',
          url: '',
          resource: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Nft

      const userWithNfts = userFactory({
        userId: 'user-123',
        email: 'test@example.com',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        uniqueToken: 'unique-token',
      })
      userWithNfts.nfts = [mockNftWithMissingMetadata]
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithNfts)

      // No need to mock getTokenData since we're using nftSupply data directly

      const payload = { email: 'test@example.com' }

      const result = await listNft.handle(payload)

      expect(result.data.nfts[0]).toEqual(
        expect.objectContaining({
          code: 'TEST',
          name: 'Test NFT',
          description: '',
          url: '',
          contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          resource: '',
          token_id: 'token-123',
          transaction_hash: 'tx-hash-123',
        })
      )
    })

    it('should validate input payload', async () => {
      const invalidPayload = { email: 123 } // Invalid email type should fail validation

      await expect(listNft.handle(invalidPayload as unknown as RequestSchemaT)).rejects.toThrow()
    })
  })

  describe('parseResponse', () => {
    it('should parse response correctly', () => {
      const nftData: NftSchemaT[] = [
        {
          token_id: 'token-123',
          code: 'TEST',
          name: 'Test NFT',
          description: 'A test NFT',
          url: 'https://example.com',
        },
      ]

      const result = listNft.parseResponse({ nfts: nftData })

      expect(result).toEqual(
        expect.objectContaining({
          data: {
            nfts: [
              expect.objectContaining({
                code: 'TEST',
                name: 'Test NFT',
                description: 'A test NFT',
                url: 'https://example.com',
              }),
            ],
          },
          message: 'Tokens list retrieved successfully',
        })
      )
    })
  })

  describe('constructor', () => {
    it('should use provided user repository when passed', () => {
      const customUserRepository = mockUserRepository()
      const customListNft = new ListNft(customUserRepository)

      expect(customListNft).toBeInstanceOf(ListNft)
    })

    it('should use default user repository when none provided', () => {
      const defaultListNft = new ListNft()

      expect(defaultListNft).toBeInstanceOf(ListNft)
    })
  })

  describe('endpoint', () => {
    it('should export correct endpoint', () => {
      expect(endpoint).toBe('/nft')
    })
  })
})
