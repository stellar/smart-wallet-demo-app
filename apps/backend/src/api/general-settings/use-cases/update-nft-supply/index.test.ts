import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { nftSupplyFactory } from 'api/core/entities/nft-supply/factory'
import { mockNftSupplyRepository } from 'api/core/services/nft-supply/mock'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ZodValidationException } from 'errors/exceptions/zod-validation'

import { RequestSchemaT } from './types'

import { UpdateNftSupply, endpoint } from './index'

const mockedNftSupplyRepository = mockNftSupplyRepository()

const mockResponse = () => {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  return res as Response
}

const mockRequest = (body: Partial<RequestSchemaT>, params?: { id: string }): Request => {
  return {
    body,
    params,
  } as unknown as Request
}

let updateNftSupply: UpdateNftSupply

describe('UpdateNftSupply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateNftSupply = new UpdateNftSupply(mockedNftSupplyRepository)
  })

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      const customRepository = mockNftSupplyRepository()
      const useCase = new UpdateNftSupply(customRepository)
      expect(useCase).toBeInstanceOf(UpdateNftSupply)
    })

    it('should create instance with default repository when none provided', () => {
      const useCase = new UpdateNftSupply()
      expect(useCase).toBeInstanceOf(UpdateNftSupply)
    })
  })

  describe('executeHttp', () => {
    it('should execute HTTP request and return updated response', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'updated-session',
        resource: 'updated-resource',
        totalSupply: 200,
        issuer: 'updated-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const requestBody: Partial<RequestSchemaT> = {
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'updated-session',
        resource: 'updated-resource',
        total_supply: 200,
        issuer: 'updated-issuer',
      }

      const req = mockRequest(requestBody, { id: 'test-id-123' })
      const res = mockResponse()

      await updateNftSupply.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          nft_collection: {
            name: 'Updated NFT',
            description: 'Updated Description',
            url: 'https://example.com/updated.png',
            code: 'UPD',
            contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
            session_id: 'updated-session',
            resource: 'updated-resource',
            total_supply: 200,
            issuer: 'updated-issuer',
          },
        },
        message: 'NftSupply updated successfully',
      })
    })

    it('should handle request with all required fields', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'updated-session',
        resource: 'updated-resource',
        totalSupply: 200,
        issuer: 'updated-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const requestBody: Partial<RequestSchemaT> = {
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'updated-session',
        resource: 'updated-resource',
        total_supply: 200,
        issuer: 'updated-issuer',
      }

      const req = mockRequest(requestBody, { id: 'test-id-123' })
      const res = mockResponse()

      await updateNftSupply.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          nft_collection: {
            name: 'Updated NFT',
            description: 'Updated Description',
            url: 'https://example.com/updated.png',
            code: 'UPD',
            contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
            session_id: 'updated-session',
            resource: 'updated-resource',
            total_supply: 200,
            issuer: 'updated-issuer',
          },
        },
        message: 'NftSupply updated successfully',
      })
    })
  })

  describe('parseResponse', () => {
    it('should parse NftSupply entity to response format', () => {
      const nftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
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

      const result = updateNftSupply.parseResponse(nftSupply)

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
        nftSupplyId: 'test-id-123',
        name: 'Minimal NFT',
        description: 'Minimal Description',
        url: 'https://example.com/minimal.png',
        code: 'MIN',
        contractAddress: 'MINIMALCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        sessionId: 'minimal-session',
        resource: 'minimal-resource',
        totalSupply: 1,
      })

      const result = updateNftSupply.parseResponse(nftSupply)

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
    it('should update NFT supply successfully with valid payload', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'updated-session',
        resource: 'updated-resource',
        totalSupply: 200,
        issuer: 'updated-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'updated-session',
        resource: 'updated-resource',
        total_supply: 200,
        issuer: 'updated-issuer',
      }

      const result = await updateNftSupply.handle(payload)

      expect(result).toEqual({
        data: {
          nft_collection: {
            name: 'Updated NFT',
            description: 'Updated Description',
            url: 'https://example.com/updated.png',
            code: 'UPD',
            contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
            session_id: 'updated-session',
            resource: 'updated-resource',
            total_supply: 200,
            issuer: 'updated-issuer',
          },
        },
        message: 'NftSupply updated successfully',
      })

      expect(mockedNftSupplyRepository.updateNftSupply).toHaveBeenCalledWith('test-id-123', {
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'updated-session',
        resource: 'updated-resource',
        totalSupply: 200,
        issuer: 'updated-issuer',
      })
    })

    it('should update NFT supply successfully with partial fields', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Partially Updated NFT',
        description: 'Original Description',
        url: 'https://example.com/original.png',
        code: 'ORIG',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'original-session',
        resource: 'original-resource',
        totalSupply: 100,
        issuer: 'original-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
        name: 'Partially Updated NFT',
        description: 'Original Description',
        url: 'https://example.com/original.png',
        code: 'ORIG',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'original-session',
        resource: 'original-resource',
        total_supply: 100,
        issuer: 'original-issuer',
      }

      const result = await updateNftSupply.handle(payload)

      expect(result).toEqual({
        data: {
          nft_collection: {
            name: 'Partially Updated NFT',
            description: 'Original Description',
            url: 'https://example.com/original.png',
            code: 'ORIG',
            contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
            session_id: 'original-session',
            resource: 'original-resource',
            total_supply: 100,
            issuer: 'original-issuer',
          },
        },
        message: 'NftSupply updated successfully',
      })
    })

    it('should throw ZodValidationException for invalid payload', async () => {
      const invalidPayload = {
        id: 'test-id-123',
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

      await expect(updateNftSupply.handle(invalidPayload as RequestSchemaT)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.updateNftSupply).not.toHaveBeenCalled()
    })

    it('should throw ZodValidationException for missing required fields', async () => {
      const invalidPayload = {
        id: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        // Missing url, code, contract_address, session_id, resource, total_supply, issuer
      }

      await expect(updateNftSupply.handle(invalidPayload as RequestSchemaT)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.updateNftSupply).not.toHaveBeenCalled()
    })

    it('should throw ZodValidationException for invalid total_supply', async () => {
      const invalidPayload: RequestSchemaT = {
        id: 'test-id-123',
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

      await expect(updateNftSupply.handle(invalidPayload)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.updateNftSupply).not.toHaveBeenCalled()
    })

    it('should throw ZodValidationException for non-integer total_supply', async () => {
      const invalidPayload = {
        id: 'test-id-123',
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

      await expect(updateNftSupply.handle(invalidPayload as RequestSchemaT)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.updateNftSupply).not.toHaveBeenCalled()
    })

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockedNftSupplyRepository.updateNftSupply.mockRejectedValue(error)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
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

      await expect(updateNftSupply.handle(payload)).rejects.toThrow('Database connection failed')

      expect(mockedNftSupplyRepository.updateNftSupply).toHaveBeenCalledWith('test-id-123', {
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
    })

    it('should handle missing id in payload', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'updated-session',
        resource: 'updated-resource',
        totalSupply: 200,
        issuer: 'updated-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload = {
        name: 'Updated NFT',
        description: 'Updated Description',
        url: 'https://example.com/updated.png',
        code: 'UPD',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'updated-session',
        resource: 'updated-resource',
        total_supply: 200,
        issuer: 'updated-issuer',
      }

      // This should fail validation since id is required
      await expect(updateNftSupply.handle(payload as RequestSchemaT)).rejects.toThrow(ZodValidationException)

      expect(mockedNftSupplyRepository.updateNftSupply).not.toHaveBeenCalled()
    })
  })

  describe('endpoint export', () => {
    it('should export the correct endpoint', () => {
      expect(endpoint).toBe('/:id')
    })
  })

  describe('edge cases', () => {
    it('should handle very long strings in text fields', async () => {
      const longString = 'a'.repeat(1000)
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
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

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
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

      const result = await updateNftSupply.handle(payload)

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
        nftSupplyId: 'test-id-123',
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

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
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

      const result = await updateNftSupply.handle(payload)

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
        nftSupplyId: 'test-id-123',
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

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
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

      const result = await updateNftSupply.handle(payload)

      expect(result.data.nft_collection.total_supply).toBe(maxSupply)
    })

    it('should handle minimum valid total_supply', async () => {
      const minSupply = 1
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Min Supply NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'MIN',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'min-session',
        resource: 'min-resource',
        totalSupply: minSupply,
        issuer: 'min-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
        name: 'Min Supply NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'MIN',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'min-session',
        resource: 'min-resource',
        total_supply: minSupply,
        issuer: 'min-issuer',
      }

      const result = await updateNftSupply.handle(payload)

      expect(result.data.nft_collection.total_supply).toBe(minSupply)
    })

    it('should handle empty string issuer', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'test-session',
        resource: 'test-resource',
        totalSupply: 100,
        issuer: '',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 100,
        issuer: '',
      }

      const result = await updateNftSupply.handle(payload)

      expect(result.data.nft_collection.issuer).toBe('')
    })
  })

  describe('field mapping', () => {
    it('should correctly map contract_address to contractAddress', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contractAddress: 'NEWCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        sessionId: 'test-session',
        resource: 'test-resource',
        totalSupply: 100,
        issuer: 'test-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'NEWCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 100,
        issuer: 'test-issuer',
      }

      await updateNftSupply.handle(payload)

      expect(mockedNftSupplyRepository.updateNftSupply).toHaveBeenCalledWith(
        'test-id-123',
        expect.objectContaining({
          contractAddress: 'NEWCONTRACTADDRESS123456789012345678901234567890123456789012345678',
        })
      )
    })

    it('should correctly map session_id to sessionId', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'new-session-id',
        resource: 'test-resource',
        totalSupply: 100,
        issuer: 'test-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'new-session-id',
        resource: 'test-resource',
        total_supply: 100,
        issuer: 'test-issuer',
      }

      await updateNftSupply.handle(payload)

      expect(mockedNftSupplyRepository.updateNftSupply).toHaveBeenCalledWith(
        'test-id-123',
        expect.objectContaining({
          sessionId: 'new-session-id',
        })
      )
    })

    it('should correctly map total_supply to totalSupply', async () => {
      const mockNftSupply = nftSupplyFactory({
        nftSupplyId: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        sessionId: 'test-session',
        resource: 'test-resource',
        totalSupply: 500,
        issuer: 'test-issuer',
      })

      mockedNftSupplyRepository.updateNftSupply.mockResolvedValue(mockNftSupply)

      const payload: RequestSchemaT = {
        id: 'test-id-123',
        name: 'Test NFT',
        description: 'Test Description',
        url: 'https://example.com/image.png',
        code: 'TEST',
        contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
        session_id: 'test-session',
        resource: 'test-resource',
        total_supply: 500,
        issuer: 'test-issuer',
      }

      await updateNftSupply.handle(payload)

      expect(mockedNftSupplyRepository.updateNftSupply).toHaveBeenCalledWith(
        'test-id-123',
        expect.objectContaining({
          totalSupply: 500,
        })
      )
    })
  })
})
