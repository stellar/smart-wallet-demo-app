import { rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { assetFactory } from 'api/core/entities/asset/factory'
import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { vendorFactory } from 'api/core/entities/vendor/factory'
import { getWalletBalance } from 'api/core/helpers/get-balance'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockAssetRepository } from 'api/core/services/asset/mock'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { mockVendorRepository } from 'api/core/services/vendor/mock'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'

import { TransferOptions } from '.'

// Mock the getWalletBalance function
vi.mock('api/core/helpers/get-balance', () => ({
  getWalletBalance: vi.fn(),
}))

const mockPasskeys = [
  passkeyFactory({
    credentialId: 'cred-1',
    transports: ['usb', 'nfc'],
  }),
  passkeyFactory({
    credentialId: 'cred-2',
    transports: ['cable'],
  }),
]

const mockUser = userFactory({
  email: 'test@example.com',
  contractAddress: 'GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5',
  passkeys: mockPasskeys,
})

const mockAsset = assetFactory({
  code: 'XLM',
  type: 'native',
  contractAddress: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
})

const mockVendor = vendorFactory({
  name: 'Test Vendor',
  walletAddress: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
  profileImage: 'https://example.com/image.png',
})

const mockChallenge = 'mock-challenge-data'
const mockOptions = '{"challenge":"mock-challenge","userVerification":"required"}'

const mockedUserRepository = mockUserRepository()
const mockedAssetRepository = mockAssetRepository()
const mockedVendorRepository = mockVendorRepository()
const mockedWebauthnAuthenticationHelper = mockWebAuthnAuthentication()
const mockedSorobanService = mockSorobanService()

const mockedGenerateOptions = vi.fn()
const mockedGenerateWebAuthnChallenge = vi.fn()

mockedWebauthnAuthenticationHelper.generateOptions = mockedGenerateOptions
mockedSorobanService.generateWebAuthnChallenge = mockedGenerateWebAuthnChallenge

let useCase: TransferOptions

describe('TransferOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new TransferOptions(
      mockedAssetRepository,
      mockedUserRepository,
      mockedVendorRepository,
      mockedWebauthnAuthenticationHelper,
      mockedSorobanService
    )

    // Mock the simulateContractOperation method
    mockedSorobanService.simulateContractOperation.mockResolvedValue({
      tx: { hash: 'test-tx-hash' } as unknown as Transaction,
      simulationResponse: { id: 'simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
    })
    // Mock getWalletBalance to return 10
    vi.mocked(getWalletBalance).mockResolvedValue(10)
  })

  describe('handle', () => {
    it('should return transfer options successfully', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer' as const,
        asset: 'XLM',
        to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        amount: 100,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(mockOptions)
      mockedVendorRepository.getVendorByWalletAddress.mockResolvedValue(mockVendor)

      // getWalletBalance is already mocked in beforeEach

      const result = await useCase.handle(payload)

      expect(result.data.options_json).toBe(mockOptions)
      expect(result.data.user.email).toBe(mockUser.email)
      expect(result.data.user.address).toBe(mockUser.contractAddress)
      expect(result.data.user.balance).toBe(10) // Converted from stroops
      expect(result.data.vendor).toEqual({
        name: mockVendor.name,
        wallet_address: mockVendor.walletAddress,
        profile_image: mockVendor.profileImage,
      })
      expect(result.message).toBe('Retrieved transaction options successfully')
    })

    it('should return transfer options without vendor when vendor not found', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer' as const,
        asset: 'XLM',
        to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        amount: 100,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(mockOptions)
      mockedVendorRepository.getVendorByWalletAddress.mockResolvedValue(null)

      // getWalletBalance is already mocked in beforeEach

      const result = await useCase.handle(payload)

      expect(result.data.vendor).toBeUndefined()
    })

    it('should throw ResourceNotFoundException when asset not found', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer' as const,
        asset: 'UNKNOWN',
        to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        amount: 100,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when user has no balance', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer' as const,
        asset: 'XLM',
        to: 'GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5',
        amount: 100,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)

      // Mock getWalletBalance to return 0
      vi.mocked(getWalletBalance).mockResolvedValueOnce(0)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when user not found', async () => {
      const payload = {
        email: 'notfound@example.com',
        type: 'transfer' as const,
        asset: 'XLM',
        to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        amount: 100,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when user has no passkeys', async () => {
      const userWithoutPasskeys = userFactory({ ...mockUser, passkeys: [] })
      const payload = {
        email: mockUser.email,
        type: 'transfer' as const,
        asset: 'XLM',
        to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        amount: 100,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    })

    it('should throw error when WebAuthn options generation fails', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer' as const,
        asset: 'XLM',
        to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        amount: 100,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toThrow('The requested resource was not found')
    })

    it('should validate payload and throw on invalid data', async () => {
      const invalidPayload = {
        email: 'invalid-email',
        type: 'transfer' as const,
        asset: 'XLM',
        to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
        amount: 100,
      }

      await expect(useCase.handle(invalidPayload)).rejects.toThrow()
    })
  })

  describe('executeHttp', () => {
    it('should call response with correct status and json', async () => {
      const req = {
        userData: { email: mockUser.email },
        query: {
          type: 'transfer',
          asset: 'XLM',
          to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
          amount: 100,
        },
      } as unknown as Request

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(mockOptions)
      mockedVendorRepository.getVendorByWalletAddress.mockResolvedValue(mockVendor)

      // getWalletBalance is already mocked in beforeEach

      await useCase.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          options_json: mockOptions,
          user: {
            email: mockUser.email,
            address: mockUser.contractAddress,
            balance: 10,
          },
          vendor: {
            name: mockVendor.name,
            wallet_address: mockVendor.walletAddress,
            profile_image: mockVendor.profileImage,
          },
        },
        message: 'Retrieved transaction options successfully',
      })
    })

    it('should throw UnauthorizedException when no email in userData', async () => {
      const req = {
        userData: {},
        query: {
          type: 'transfer',
          asset: 'XLM',
          to: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
          amount: 100,
        },
      } as unknown as Request

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(req, res)).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('should handle missing query parameters gracefully', async () => {
      const req = {
        userData: { email: mockUser.email },
        query: {
          type: 'transfer',
          asset: 'XLM',
          to: 'GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5',
          amount: 100,
        },
      } as unknown as Request

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(mockOptions)
      mockedVendorRepository.getVendorByWalletAddress.mockResolvedValue(null)

      // getWalletBalance is already mocked in beforeEach

      await useCase.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    })
  })
})
