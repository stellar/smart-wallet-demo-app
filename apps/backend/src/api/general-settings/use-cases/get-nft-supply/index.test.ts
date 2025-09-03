import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { nftSupplyFactory } from 'api/core/entities/nft-supply/factory'
import { mockNftSupplyRepository } from 'api/core/services/nft-supply/mock'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

import { GetNftSupply, endpoint } from './index'

const mockedNftSupplyRepository = mockNftSupplyRepository()

const mockResponse = () => {
  const res: Partial<Response<ResponseSchemaT>> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  return res as Response<ResponseSchemaT>
}

const mockRequest = (): Request => {
  return {} as Request
}

let getNftSupply: GetNftSupply

describe('GetNftSupply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getNftSupply = new GetNftSupply(mockedNftSupplyRepository)
  })

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      const customRepository = mockNftSupplyRepository()
      const useCase = new GetNftSupply(customRepository)
      expect(useCase).toBeInstanceOf(GetNftSupply)
    })

    it('should create instance with default repository when none provided', () => {
      const useCase = new GetNftSupply()
      expect(useCase).toBeInstanceOf(GetNftSupply)
    })
  })

  describe('executeHttp', () => {
    it('should execute HTTP request and return successful response', async () => {
      const mockNftSupplyList = [
        nftSupplyFactory({
          name: 'Test NFT 1',
          description: 'Test Description 1',
          url: 'https://example.com/image1.png',
          code: 'TEST1',
          contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          sessionId: 'test-session-1',
          resource: 'test-resource-1',
          totalSupply: 100,
          issuer: 'test-issuer-1',
        }),
        nftSupplyFactory({
          name: 'Test NFT 2',
          description: 'Test Description 2',
          url: 'https://example.com/image2.png',
          code: 'TEST2',
          contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          sessionId: 'test-session-2',
          resource: 'test-resource-2',
          totalSupply: 200,
          issuer: 'test-issuer-2',
        }),
      ]

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue(mockNftSupplyList)

      const req = mockRequest()
      const res = mockResponse()

      await getNftSupply.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          nft_collections: [
            {
              id: mockNftSupplyList[0].nftSupplyId,
              name: 'Test NFT 1',
              description: 'Test Description 1',
              url: 'https://example.com/image1.png',
              code: 'TEST1',
              contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
              session_id: 'test-session-1',
              resource: 'test-resource-1',
              total_supply: 100,
              issuer: 'test-issuer-1',
            },
            {
              id: mockNftSupplyList[1].nftSupplyId,
              name: 'Test NFT 2',
              description: 'Test Description 2',
              url: 'https://example.com/image2.png',
              code: 'TEST2',
              contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
              session_id: 'test-session-2',
              resource: 'test-resource-2',
              total_supply: 200,
              issuer: 'test-issuer-2',
            },
          ],
        },
        message: 'Retrieved assets successfully',
      })
    })

    it('should handle empty NFT supply list', async () => {
      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([])

      const req = mockRequest()
      const res = mockResponse()

      await getNftSupply.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          nft_collections: [],
        },
        message: 'Retrieved assets successfully',
      })
    })

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockedNftSupplyRepository.getNftSupplyList.mockRejectedValue(error)

      const req = mockRequest()
      const res = mockResponse()

      await expect(getNftSupply.executeHttp(req, res)).rejects.toThrow('Database connection failed')
    })
  })

  describe('parseResponse', () => {
    it('should parse NftSupply entity to response format', () => {
      const nftSupply = nftSupplyFactory({
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'test-session',
        resource: 'test-resource',
        totalSupply: 100,
        issuer: 'test-issuer',
      })

      const result = getNftSupply.parseResponse([nftSupply])

      expect(result).toEqual([
        {
          id: nftSupply.nftSupplyId,
          name: 'Test NFT',
          description: 'Test Description',
          url: 'https://example.com/image.png',
          code: 'TEST',
          contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          session_id: 'test-session',
          resource: 'test-resource',
          total_supply: 100,
          issuer: 'test-issuer',
        },
      ])
    })

    it('should parse multiple NftSupply entities to response format', () => {
      const nftSupplyList = [
        nftSupplyFactory({
          name: 'NFT 1',
          description: 'Description 1',
          url: 'https://example.com/1.png',
          code: 'NFT1',
          contractAddress: 'CONTRACT1ADDRESS123456789012345678901234567890123456789012345678',
          sessionId: 'session-1',
          resource: 'resource-1',
          totalSupply: 50,
          issuer: 'issuer-1',
        }),
        nftSupplyFactory({
          name: 'NFT 2',
          description: 'Description 2',
          url: 'https://example.com/2.png',
          code: 'NFT2',
          contractAddress: 'CONTRACT2ADDRESS123456789012345678901234567890123456789012345678',
          sessionId: 'session-2',
          resource: 'resource-2',
          totalSupply: 75,
          issuer: 'issuer-2',
        }),
      ]

      const result = getNftSupply.parseResponse(nftSupplyList)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: nftSupplyList[0].nftSupplyId,
        name: 'NFT 1',
        description: 'Description 1',
        url: 'https://example.com/1.png',
        code: 'NFT1',
        contract_address: 'CONTRACT1ADDRESS123456789012345678901234567890123456789012345678',
        session_id: 'session-1',
        resource: 'resource-1',
        total_supply: 50,
        issuer: 'issuer-1',
      })
      expect(result[1]).toEqual({
        id: nftSupplyList[1].nftSupplyId,
        name: 'NFT 2',
        description: 'Description 2',
        url: 'https://example.com/2.png',
        code: 'NFT2',
        contract_address: 'CONTRACT2ADDRESS123456789012345678901234567890123456789012345678',
        session_id: 'session-2',
        resource: 'resource-2',
        total_supply: 75,
        issuer: 'issuer-2',
      })
    })

    it('should handle NftSupply with minimal required fields', () => {
      const nftSupply = nftSupplyFactory({
        name: 'Minimal NFT',
        description: 'Minimal Description',
        url: 'https://example.com/minimal.png',
        code: 'MIN',
        contractAddress: 'MINIMALCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        sessionId: 'minimal-session',
        resource: 'minimal-resource',
        totalSupply: 1,
      })

      const result = getNftSupply.parseResponse([nftSupply])

      expect(result[0]).toEqual({
        id: nftSupply.nftSupplyId,
        name: 'Minimal NFT',
        description: 'Minimal Description',
        url: 'https://example.com/minimal.png',
        code: 'MIN',
        contract_address: 'MINIMALCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        session_id: 'minimal-session',
        resource: 'minimal-resource',
        total_supply: 1,
        issuer: undefined,
      })
    })

    it('should handle empty array', () => {
      const result = getNftSupply.parseResponse([])
      expect(result).toEqual([])
    })
  })

  describe('handle', () => {
    it('should retrieve NFT supply list successfully', async () => {
      const mockNftSupplyList = [
        nftSupplyFactory({
          name: 'Test NFT 1',
          description: 'Test Description 1',
          url: 'https://example.com/image1.png',
          code: 'TEST1',
          contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          sessionId: 'test-session-1',
          resource: 'test-resource-1',
          totalSupply: 100,
          issuer: 'test-issuer-1',
        }),
        nftSupplyFactory({
          name: 'Test NFT 2',
          description: 'Test Description 2',
          url: 'https://example.com/image2.png',
          code: 'TEST2',
          contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          sessionId: 'test-session-2',
          resource: 'test-resource-2',
          totalSupply: 200,
          issuer: 'test-issuer-2',
        }),
      ]

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue(mockNftSupplyList)

      const result = await getNftSupply.handle()

      expect(result).toEqual({
        data: {
          nft_collections: [
            {
              id: mockNftSupplyList[0].nftSupplyId,
              name: 'Test NFT 1',
              description: 'Test Description 1',
              url: 'https://example.com/image1.png',
              code: 'TEST1',
              contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
              session_id: 'test-session-1',
              resource: 'test-resource-1',
              total_supply: 100,
              issuer: 'test-issuer-1',
            },
            {
              id: mockNftSupplyList[1].nftSupplyId,
              name: 'Test NFT 2',
              description: 'Test Description 2',
              url: 'https://example.com/image2.png',
              code: 'TEST2',
              contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
              session_id: 'test-session-2',
              resource: 'test-resource-2',
              total_supply: 200,
              issuer: 'test-issuer-2',
            },
          ],
        },
        message: 'Retrieved assets successfully',
      })

      expect(mockedNftSupplyRepository.getNftSupplyList).toHaveBeenCalledTimes(1)
      expect(mockedNftSupplyRepository.getNftSupplyList).toHaveBeenCalledWith()
    })

    it('should handle empty NFT supply list', async () => {
      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([])

      const result = await getNftSupply.handle()

      expect(result).toEqual({
        data: {
          nft_collections: [],
        },
        message: 'Retrieved assets successfully',
      })

      expect(mockedNftSupplyRepository.getNftSupplyList).toHaveBeenCalledTimes(1)
    })

    it('should handle single NFT supply item', async () => {
      const mockNftSupply = nftSupplyFactory({
        name: 'Single NFT',
        description: 'Single Description',
        url: 'https://example.com/single.png',
        code: 'SINGLE',
        contractAddress: 'SINGLECONTRACTADDRESS123456789012345678901234567890123456789012345678',
        sessionId: 'single-session',
        resource: 'single-resource',
        totalSupply: 25,
        issuer: 'single-issuer',
      })

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([mockNftSupply])

      const result = await getNftSupply.handle()

      expect(result).toEqual({
        data: {
          nft_collections: [
            {
              id: mockNftSupply.nftSupplyId,
              name: 'Single NFT',
              description: 'Single Description',
              url: 'https://example.com/single.png',
              code: 'SINGLE',
              contract_address: 'SINGLECONTRACTADDRESS123456789012345678901234567890123456789012345678',
              session_id: 'single-session',
              resource: 'single-resource',
              total_supply: 25,
              issuer: 'single-issuer',
            },
          ],
        },
        message: 'Retrieved assets successfully',
      })
    })

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockedNftSupplyRepository.getNftSupplyList.mockRejectedValue(error)

      await expect(getNftSupply.handle()).rejects.toThrow('Database connection failed')

      expect(mockedNftSupplyRepository.getNftSupplyList).toHaveBeenCalledTimes(1)
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      mockedNftSupplyRepository.getNftSupplyList.mockRejectedValue(timeoutError)

      await expect(getNftSupply.handle()).rejects.toThrow('Request timeout')
    })

    it('should handle database constraint violations', async () => {
      const constraintError = new Error('UNIQUE constraint failed')
      mockedNftSupplyRepository.getNftSupplyList.mockRejectedValue(constraintError)

      await expect(getNftSupply.handle()).rejects.toThrow('UNIQUE constraint failed')
    })
  })

  describe('endpoint export', () => {
    it('should export the correct endpoint', () => {
      expect(endpoint).toBe('/')
    })
  })

  describe('edge cases', () => {
    it('should handle very long strings in text fields', async () => {
      const longString = 'a'.repeat(1000)
      const mockNftSupply = nftSupplyFactory({
        name: longString,
        description: longString,
        url: longString,
        code: 'TEST',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: longString,
        resource: longString,
        totalSupply: 100,
        issuer: longString,
      })

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([mockNftSupply])

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections[0].name).toBe(longString)
      expect(result.data.nft_collections[0].description).toBe(longString)
      expect(result.data.nft_collections[0].url).toBe(longString)
      expect(result.data.nft_collections[0].session_id).toBe(longString)
      expect(result.data.nft_collections[0].resource).toBe(longString)
      expect(result.data.nft_collections[0].issuer).toBe(longString)
    })

    it('should handle special characters in text fields', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const mockNftSupply = nftSupplyFactory({
        name: specialChars,
        description: specialChars,
        url: specialChars,
        code: 'TEST',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: specialChars,
        resource: specialChars,
        totalSupply: 100,
        issuer: specialChars,
      })

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([mockNftSupply])

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections[0].name).toBe(specialChars)
      expect(result.data.nft_collections[0].description).toBe(specialChars)
      expect(result.data.nft_collections[0].url).toBe(specialChars)
      expect(result.data.nft_collections[0].session_id).toBe(specialChars)
      expect(result.data.nft_collections[0].resource).toBe(specialChars)
      expect(result.data.nft_collections[0].issuer).toBe(specialChars)
    })

    it('should handle maximum valid total_supply values', async () => {
      const maxSupply = Number.MAX_SAFE_INTEGER
      const mockNftSupply = nftSupplyFactory({
        name: 'Max Supply NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'MAX',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'max-session',
        resource: 'max-resource',
        totalSupply: maxSupply,
        issuer: 'max-issuer',
      })

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([mockNftSupply])

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections[0].total_supply).toBe(maxSupply)
    })

    it('should handle zero total_supply', async () => {
      const mockNftSupply = nftSupplyFactory({
        name: 'Zero Supply NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'ZERO',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'zero-session',
        resource: 'zero-resource',
        totalSupply: 0,
        issuer: 'zero-issuer',
      })

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([mockNftSupply])

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections[0].total_supply).toBe(0)
    })

    it('should handle large number of NFT supplies', async () => {
      const largeList = Array.from({ length: 1000 }, (_, index) =>
        nftSupplyFactory({
          name: `NFT ${index}`,
          description: `Description ${index}`,
          url: `https://example.com/${index}.png`,
          code: `NFT${index}`,
          contractAddress: `CONTRACT${index}ADDRESS123456789012345678901234567890123456789012345678`,
          sessionId: `session-${index}`,
          resource: `resource-${index}`,
          totalSupply: index + 1,
          issuer: `issuer-${index}`,
        })
      )

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue(largeList)

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections).toHaveLength(1000)
      expect(result.data.nft_collections[0].name).toBe('NFT 0')
      expect(result.data.nft_collections[999].name).toBe('NFT 999')
    })

    it('should handle NFT supplies with undefined optional fields', async () => {
      const mockNftSupply = nftSupplyFactory({
        name: 'Optional Fields NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'OPT',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'optional-session',
        resource: 'optional-resource',
        totalSupply: 50,
        // issuer is undefined
      })

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([mockNftSupply])

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections[0].issuer).toBeUndefined()
    })

    it('should handle NFT supplies with null-like values', async () => {
      const mockNftSupply = nftSupplyFactory({
        name: 'Null-like NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'NULL',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'null-session',
        resource: 'null-resource',
        totalSupply: 25,
        issuer: 'null-issuer',
      })

      // Set optional fields to null-like values
      mockNftSupply.issuer = null as unknown as string
      mockNftSupply.mintedAmount = null as unknown as number

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue([mockNftSupply])

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections[0].issuer).toBeNull()
    })
  })

  describe('integration scenarios', () => {
    it('should handle mixed data types and formats', async () => {
      const mockNftSupplyList = [
        nftSupplyFactory({
          name: 'Mixed Data NFT',
          description: 'Description with numbers 123 and symbols !@#',
          url: 'https://example.com/mixed-123.png',
          code: 'MIX123',
          contractAddress: 'MIXEDCONTRACTADDRESS123456789012345678901234567890123456789012345678',
          sessionId: 'mixed-session-123',
          resource: 'mixed_resource_123',
          totalSupply: 123,
          issuer: 'mixed-issuer-123',
        }),
        nftSupplyFactory({
          name: 'Unicode NFT 🚀',
          description: 'Description with emojis 🎉 and unicode characters ñáéíóú',
          url: 'https://example.com/unicode-🚀.png',
          code: 'UNI🚀',
          contractAddress: 'UNICODECONTRACTADDRESS123456789012345678901234567890123456789012345678',
          sessionId: 'unicode-session-🚀',
          resource: 'unicode_resource_🚀',
          totalSupply: 999,
          issuer: 'unicode-issuer-🚀',
        }),
      ]

      mockedNftSupplyRepository.getNftSupplyList.mockResolvedValue(mockNftSupplyList)

      const result = await getNftSupply.handle()

      expect(result.data.nft_collections).toHaveLength(2)
      expect(result.data.nft_collections[0].name).toBe('Mixed Data NFT')
      expect(result.data.nft_collections[1].name).toBe('Unicode NFT 🚀')
    })

    it('should maintain data integrity through parsing', async () => {
      const originalNftSupply = nftSupplyFactory({
        name: 'Original NFT',
        description: 'Original Description',
        url: 'https://example.com/original.png',
        code: 'ORIG',
        contractAddress: 'ORIGINALCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        sessionId: 'original-session',
        resource: 'original-resource',
        totalSupply: 100,
        issuer: 'original-issuer',
      })

      const parsedResult = getNftSupply.parseResponse([originalNftSupply])
      const parsedNftSupply = parsedResult[0]

      // Verify all fields are correctly mapped
      expect(parsedNftSupply.id).toBe(originalNftSupply.nftSupplyId)
      expect(parsedNftSupply.name).toBe(originalNftSupply.name)
      expect(parsedNftSupply.description).toBe(originalNftSupply.description)
      expect(parsedNftSupply.url).toBe(originalNftSupply.url)
      expect(parsedNftSupply.code).toBe(originalNftSupply.code)
      expect(parsedNftSupply.contract_address).toBe(originalNftSupply.contractAddress)
      expect(parsedNftSupply.session_id).toBe(originalNftSupply.sessionId)
      expect(parsedNftSupply.resource).toBe(originalNftSupply.resource)
      expect(parsedNftSupply.total_supply).toBe(originalNftSupply.totalSupply)
      expect(parsedNftSupply.issuer).toBe(originalNftSupply.issuer)
    })
  })
})
