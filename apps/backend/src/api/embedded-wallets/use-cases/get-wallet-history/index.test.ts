import { Request, Response } from 'express'
import { Mocked } from 'vitest'

import { userFactory } from 'api/core/entities/user/factory'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import WalletBackend from 'interfaces/wallet-backend'
import { AccountWithTransactions, GetTransactionsResponse } from 'interfaces/wallet-backend/types'

import { GetWalletHistory } from '.'

const mockUser = userFactory({
  userId: 'test-user-id',
  email: 'test@example.com',
  contractAddress: 'test-contract-address',
})

const mockWalletHistory: GetTransactionsResponse = {
  account: {
    address: 'test-contract-address',
    transactions: [
      {
        hash: 'tx-hash-1',
        envelopeXdr: 'envelope-xdr-1',
        operations: [
          {
            id: 'op-1',
            operationXdr: 'operation-xdr-1',
          },
        ],
      },
      {
        hash: 'tx-hash-2',
        envelopeXdr: 'envelope-xdr-2',
        operations: [
          {
            id: 'op-2',
            operationXdr: 'operation-xdr-2',
          },
        ],
      },
    ],
  },
}

const mockedUserRepository = mockUserRepository()

// Create a mock WalletBackend instance
const mockedWalletBackend = {
  getTransactions: vi.fn(),
  registerAccount: vi.fn(),
  deregisterAccount: vi.fn(),
  buildTransaction: vi.fn(),
  createFeeBumpTransaction: vi.fn(),
} as unknown as Mocked<WalletBackend>

let useCase: GetWalletHistory

describe('GetWalletHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetWalletHistory(mockedUserRepository, mockedWalletBackend)
  })

  describe('handle', () => {
    it('should return wallet history when user exists and has contract address', async () => {
      const payload = { id: mockUser.userId }

      mockedUserRepository.getUserById.mockResolvedValue(mockUser)
      mockedWalletBackend.getTransactions.mockResolvedValue(mockWalletHistory)

      const result = await useCase.handle(payload)

      expect(result.data.address).toBe(mockWalletHistory.account.address)
      expect(result.data.transactions).toEqual(mockWalletHistory.account.transactions)
      expect(result.message).toBe('Wallet details retrieved successfully')
      expect(mockedUserRepository.getUserById).toHaveBeenCalledWith(mockUser.userId)
      expect(mockedWalletBackend.getTransactions).toHaveBeenCalledWith({
        address: mockUser.contractAddress,
      })
    })

    it('should return wallet history with user contract address when wallet backend returns empty account', async () => {
      const payload = { id: mockUser.userId }
      const emptyWalletHistory: GetTransactionsResponse = {
        account: {
          address: 'test-contract-address',
          transactions: [],
        },
      }

      mockedUserRepository.getUserById.mockResolvedValue(mockUser)
      mockedWalletBackend.getTransactions.mockResolvedValue(emptyWalletHistory)

      const result = await useCase.handle(payload)

      expect(result.data.address).toBe(mockUser.contractAddress)
      expect(result.data.transactions).toEqual([])
      expect(result.message).toBe('Wallet details retrieved successfully')
    })

    it('should return wallet history with user contract address when wallet backend returns null account', async () => {
      const payload = { id: mockUser.userId }
      const nullWalletHistory: GetTransactionsResponse = {
        account: {} as AccountWithTransactions,
      }

      mockedUserRepository.getUserById.mockResolvedValue(mockUser)
      mockedWalletBackend.getTransactions.mockResolvedValue(nullWalletHistory)

      const result = await useCase.handle(payload)

      expect(result.data.address).toBe(mockUser.contractAddress)
      expect(result.data.transactions).toEqual([])
      expect(result.message).toBe('Wallet details retrieved successfully')
    })

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      const payload = { id: 'non-existent-user-id' }

      mockedUserRepository.getUserById.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      await expect(useCase.handle(payload)).rejects.toThrow(`The requested resource was not found`)
      expect(mockedWalletBackend.getTransactions).not.toHaveBeenCalled()
    })

    // it('should validate payload and throw on invalid data', async () => {
    //   const invalidPayload = { id: 123 } as any // Invalid type for id

    //   await expect(useCase.handle(invalidPayload)).rejects.toThrow()
    //   expect(mockedUserRepository.getUserById).not.toHaveBeenCalled()
    //   expect(mockedWalletBackend.getTransactions).not.toHaveBeenCalled()
    // })

    it('should propagate wallet backend errors', async () => {
      const payload = { id: mockUser.userId }
      const walletError = new Error('Wallet backend error')

      mockedUserRepository.getUserById.mockResolvedValue(mockUser)
      mockedWalletBackend.getTransactions.mockRejectedValue(walletError)

      await expect(useCase.handle(payload)).rejects.toThrow('Wallet backend error')
    })
  })

  describe('executeHttp', () => {
    it('should return correct response when user is authenticated', async () => {
      const req = {
        userData: { userId: mockUser.userId },
      } as unknown as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserById.mockResolvedValue(mockUser)
      mockedWalletBackend.getTransactions.mockResolvedValue(mockWalletHistory)

      await useCase.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          address: mockWalletHistory.account.address,
          transactions: mockWalletHistory.account.transactions,
        },
        message: 'Wallet details retrieved successfully',
      })
    })

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const req = {
        userData: null,
      } as unknown as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(req, res)).rejects.toBeInstanceOf(UnauthorizedException)
      await expect(useCase.executeHttp(req, res)).rejects.toThrow("You don't have permission to do this action")
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException when userData is undefined', async () => {
      const req = {
        userData: undefined,
      } as unknown as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(req, res)).rejects.toBeInstanceOf(UnauthorizedException)
      await expect(useCase.executeHttp(req, res)).rejects.toThrow("You don't have permission to do this action")
    })

    it('should throw UnauthorizedException when userId is missing', async () => {
      const req = {
        userData: { userId: null },
      } as unknown as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(req, res)).rejects.toBeInstanceOf(UnauthorizedException)
      await expect(useCase.executeHttp(req, res)).rejects.toThrow("You don't have permission to do this action")
    })
  })

  describe('parseResponse', () => {
    it('should parse response correctly', () => {
      const parseData = {
        address: 'test-address',
        transactions: [{ hash: 'test-hash' }],
      }

      const result = useCase.parseResponse(parseData)

      expect(result).toEqual({
        data: {
          address: 'test-address',
          transactions: [{ hash: 'test-hash' }],
        },
        message: 'Wallet details retrieved successfully',
      })
    })
  })
})
