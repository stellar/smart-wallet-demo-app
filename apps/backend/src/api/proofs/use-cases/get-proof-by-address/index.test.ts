import { Request, Response } from 'express'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { mockProofRepository } from 'api/core/services/proof/mocks'
import { messages } from 'api/proofs/constants/messages'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'

import { RequestSchemaT } from './types'

import { GetProofByAddress } from './index'

const mockedProofRepository = mockProofRepository()

const mockResponse = () => {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  return res as Response
}

describe('GetProofByAddress UseCase', () => {
  let useCase: GetProofByAddress
  let mockPayload: RequestSchemaT

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetProofByAddress(mockedProofRepository)
    mockPayload = {
      address: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
    }
  })

  describe('executeHttp', () => {
    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const req = {
        params: mockPayload,
        userData: undefined,
      } as unknown as Request
      const res = mockResponse()

      await expect(useCase.executeHttp(req, res)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException if userId is missing', async () => {
      const req = {
        params: mockPayload,
        userData: { email: 'test@example.com' },
      } as unknown as Request
      const res = mockResponse()

      await expect(useCase.executeHttp(req, res)).rejects.toThrow(UnauthorizedException)
    })

    it('should process request successfully when user is authenticated', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        index: 0,
        receiverAmount: '100000000',
        proofs: ['cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f'],
        createdAt: new Date(),
      }

      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProofData)

      const req = {
        params: mockPayload,
        userData: { userId: 'user-123', email: 'test@example.com' },
      } as unknown as Request
      const res = mockResponse()

      await useCase.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('handle', () => {
    it('should return proof data when proof exists', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        index: 0,
        receiverAmount: '100000000',
        proofs: [
          'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f',
          '7aa34def4e37f3359bdfe5b7eebdc8d18b741b880febcf78e250a4a3f6e3fe74',
        ],
        createdAt: new Date(),
      }

      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProofData)

      const result = await useCase.handle(mockPayload)

      expect(mockedProofRepository.findByAddressAndContract).toHaveBeenCalledWith(
        'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        STELLAR.AIRDROP_CONTRACT_ADDRESS
      )

      expect(result).toEqual({
        data: {
          contractAddress: STELLAR.AIRDROP_CONTRACT_ADDRESS,
          index: 0,
          amount: 100000000,
          proofs: [
            'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f',
            '7aa34def4e37f3359bdfe5b7eebdc8d18b741b880febcf78e250a4a3f6e3fe74',
          ],
        },
        message: messages.PROOF_RETRIEVED_SUCCESSFULLY,
      })
    })

    it('should throw ResourceNotFoundException when proof does not exist', async () => {
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(null)

      await expect(useCase.handle(mockPayload)).rejects.toThrow(ResourceNotFoundException)

      expect(mockedProofRepository.findByAddressAndContract).toHaveBeenCalledWith(
        'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        STELLAR.AIRDROP_CONTRACT_ADDRESS
      )
    })

    it('should validate invalid address format', async () => {
      mockPayload.address = 'invalid-address'

      await expect(useCase.handle(mockPayload)).rejects.toThrow()
      expect(mockedProofRepository.findByAddressAndContract).not.toHaveBeenCalled()
    })

    it('should validate empty address', async () => {
      mockPayload.address = ''

      await expect(useCase.handle(mockPayload)).rejects.toThrow()
      expect(mockedProofRepository.findByAddressAndContract).not.toHaveBeenCalled()
    })

    it('should validate proof hashes are properly formatted', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        index: 0,
        receiverAmount: '100000000',
        proofs: [
          'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f',
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          '0000000000000000000000000000000000000000000000000000000000000000',
        ],
        createdAt: new Date(),
      }

      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProofData)

      const result = await useCase.handle(mockPayload)

      expect(result.data.proofs).toHaveLength(3)
      expect(result.data.proofs[0]).toBe('cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f')
      expect(result.data.proofs[1]).toBe('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      expect(result.data.proofs[2]).toBe('0000000000000000000000000000000000000000000000000000000000000000')
    })

    it('should validate contract address with StrKey', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        index: 0,
        receiverAmount: '100000000',
        proofs: ['cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f'],
        createdAt: new Date(),
      }

      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProofData)

      const result = await useCase.handle(mockPayload)

      expect(result.data.contractAddress).toBe(STELLAR.AIRDROP_CONTRACT_ADDRESS)
    })
  })
})
