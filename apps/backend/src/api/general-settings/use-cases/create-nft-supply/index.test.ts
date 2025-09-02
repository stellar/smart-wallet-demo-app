import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { nftSupplyFactory } from 'api/core/entities/nft-supply/factory'
import { mockNftSupplyRepository } from 'api/core/services/nft-supply/mock'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ZodValidationException } from 'errors/exceptions/zod-validation'

import { RequestSchemaT } from './types'

import { CreateNftSupply, endpoint } from './index'

const mockedNftSupplyRepository = mockNftSupplyRepository()

const mockResponse = () => {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  return res as Response
}

const mockRequest = (body: RequestSchemaT): Request => {
  return {
    body,
  } as Request
}

let createNftSupply: CreateNftSupply

describe('CreateNftSupply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createNftSupply = new CreateNftSupply(mockedNftSupplyRepository)
  })

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      const customRepository = mockNftSupplyRepository()
      const useCase = new CreateNftSupply(customRepository)
      expect(useCase).toBeInstanceOf(CreateNftSupply)
    })

    it('should create instance with default repository when none provided', () => {
      const useCase = new CreateNftSupply()
      expect(useCase).toBeInstanceOf(CreateNftSupply)
    })
  })

  describe('executeHttp', () => {
    it('should execute HTTP request and return created response', async () => {
      const mockNftSupply = nftSupplyFactory({
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

      mockedNftSupplyRepository.createNftSupply.mockResolvedValue(mockNftSupply)

      const requestBody: RequestSchemaT = {
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 100,
        issuer: 'test-issuer',
      }

      const req = mockRequest(requestBody)
      const res = mockResponse()

      await createNftSupply.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.CREATED)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          nft_collection: {
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
        },
        message: 'NFT collection created successfully',
      })
    })
  })

  describe('parseResponseNftSupply', () => {
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

      const result = createNftSupply.parseResponseNftSupply(nftSupply)

      expect(result).toEqual({
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 100,
        issuer: 'test-issuer',
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

      const result = createNftSupply.parseResponseNftSupply(nftSupply)

      expect(result).toEqual({
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
  })

  describe('handle', () => {
    it('should create NFT supply successfully with valid payload', async () => {
      const mockNftSupply = nftSupplyFactory({
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

      mockedNftSupplyRepository.createNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 100,
        issuer: 'test-issuer',
      }

      const result = await createNftSupply.handle(payload)

      expect(result).toEqual({
        data: {
          nft_collection: {
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
        },
        message: 'NFT collection created successfully',
      })

      expect(mockedNftSupplyRepository.createNftSupply).toHaveBeenCalledWith(
        {
          name: 'Test NFT',
          description: 'Test Description',
          url: 'https://example.com/image.png',
          code: 'TEST',
          contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          sessionId: 'test-session',
          resource: 'test-resource',
          totalSupply: 100,
          issuer: 'test-issuer',
        },
        true
      )
    })

    it('should create NFT supply successfully with minimal required fields', async () => {
      const mockNftSupply = nftSupplyFactory({
        name: 'Minimal NFT',
        description: 'Minimal Description',
        url: 'https://example.com/minimal.png',
        code: 'MIN',
        contractAddress: 'MINIMALCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        sessionId: 'minimal-session',
        resource: 'minimal-resource',
        totalSupply: 1,
        issuer: 'minimal-issuer',
      })

      mockedNftSupplyRepository.createNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        name: 'Minimal NFT',
        description: 'Minimal Description',
        url: 'https://example.com/minimal.png',
        code: 'MIN',
        contract_address: 'MINIMALCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        session_id: 'minimal-session',
        resource: 'minimal-resource',
        total_supply: 1,
        issuer: 'minimal-issuer',
      }

      const result = await createNftSupply.handle(payload)

      expect(result).toEqual({
        data: {
          nft_collection: {
            name: 'Minimal NFT',
            description: 'Minimal Description',
            url: 'https://example.com/minimal.png',
            code: 'MIN',
            contract_address: 'MINIMALCONTRACTADDRESS123456789012345678901234567890123456789012345678',
            session_id: 'minimal-session',
            resource: 'minimal-resource',
            total_supply: 1,
            issuer: 'minimal-issuer',
          },
        },
        message: 'NFT collection created successfully',
      })
    })

    it('should throw ZodValidationException for invalid payload', async () => {
      const invalidPayload = {
        name: '', // Empty name should fail validation
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 0, // Invalid: must be >= 1
        issuer: 'test-issuer',
      }

      await expect(createNftSupply.handle(invalidPayload as RequestSchemaT)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.createNftSupply).not.toHaveBeenCalled()
    })

    it('should throw ZodValidationException for missing required fields', async () => {
      const invalidPayload = {
        name: 'Test NFT',
        description: 'Test Description',
        // Missing url, code, contract_address, session_id, resource, total_supply, issuer
      }

      await expect(createNftSupply.handle(invalidPayload as RequestSchemaT)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.createNftSupply).not.toHaveBeenCalled()
    })

    it('should throw ZodValidationException for invalid total_supply', async () => {
      const invalidPayload: RequestSchemaT = {
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: -1, // Invalid: must be >= 1
        issuer: 'test-issuer',
      }

      await expect(createNftSupply.handle(invalidPayload)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.createNftSupply).not.toHaveBeenCalled()
    })

    it('should throw ZodValidationException for non-integer total_supply', async () => {
      const invalidPayload = {
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 1.5, // Invalid: must be integer
        issuer: 'test-issuer',
      }

      await expect(createNftSupply.handle(invalidPayload as RequestSchemaT)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.createNftSupply).not.toHaveBeenCalled()
    })

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockedNftSupplyRepository.createNftSupply.mockRejectedValue(error)

      const payload: RequestSchemaT = {
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 100,
        issuer: 'test-issuer',
      }

      await expect(createNftSupply.handle(payload)).rejects.toThrow('Database connection failed')

      expect(mockedNftSupplyRepository.createNftSupply).toHaveBeenCalledWith(
        {
          name: 'Test NFT',
          description: 'Test Description',
          url: 'https://example.com/image.png',
          code: 'TEST',
          contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
          sessionId: 'test-session',
          resource: 'test-resource',
          totalSupply: 100,
          issuer: 'test-issuer',
        },
        true
      )
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

      mockedNftSupplyRepository.createNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        name: longString,
        description: longString,
        url: longString,
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: longString,
        resource: longString,
        total_supply: 100,
        issuer: longString,
      }

      const result = await createNftSupply.handle(payload)

      expect(result.data.nft_collection.name).toBe(longString)
      expect(result.data.nft_collection.description).toBe(longString)
      expect(result.data.nft_collection.url).toBe(longString)
      expect(result.data.nft_collection.session_id).toBe(longString)
      expect(result.data.nft_collection.resource).toBe(longString)
      expect(result.data.nft_collection.issuer).toBe(longString)
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

      mockedNftSupplyRepository.createNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        name: specialChars,
        description: specialChars,
        url: specialChars,
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: specialChars,
        resource: specialChars,
        total_supply: 100,
        issuer: specialChars,
      }

      const result = await createNftSupply.handle(payload)

      expect(result.data.nft_collection.name).toBe(specialChars)
      expect(result.data.nft_collection.description).toBe(specialChars)
      expect(result.data.nft_collection.url).toBe(specialChars)
      expect(result.data.nft_collection.session_id).toBe(specialChars)
      expect(result.data.nft_collection.resource).toBe(specialChars)
      expect(result.data.nft_collection.issuer).toBe(specialChars)
    })

    it('should handle maximum valid total_supply', async () => {
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

      mockedNftSupplyRepository.createNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        name: 'Max Supply NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'MAX',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'max-session',
        resource: 'max-resource',
        total_supply: maxSupply,
        issuer: 'max-issuer',
      }

      const result = await createNftSupply.handle(payload)

      expect(result.data.nft_collection.total_supply).toBe(maxSupply)
    })
  })
})
