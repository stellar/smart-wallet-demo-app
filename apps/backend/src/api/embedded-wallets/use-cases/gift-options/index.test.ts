import { nativeToScVal, rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { giftClaimFactory } from 'api/core/entities/gift-claim/factory'
import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { Proof } from 'api/core/entities/proof/model'
import { userFactory } from 'api/core/entities/user/factory'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockGiftReservationRepository } from 'api/core/services/gift-claim/mocks'
import { mockProofRepository } from 'api/core/services/proof/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { STELLAR } from 'config/stellar'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockGiftEligibilityService } from 'interfaces/gift-eligibility-service/mock'
import { mockSorobanService } from 'interfaces/soroban/mock'

import { GiftOptions, endpoint } from '.'

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
  contractAddress: 'CCXTP3MIXUFBVEL7Z6MTMW3S325UO2YH5FZMSWUR3QSV5KXVABMTD75D',
  passkeys: mockPasskeys,
})

const mockProof: Proof = {
  receiverAddress: 'CCXTP3MIXUFBVEL7Z6MTMW3S325UO2YH5FZMSWUR3QSV5KXVABMTD75D',
  contractAddress: STELLAR.GIFT_AIRDROP_CONTRACT_ADDRESS,
  index: 123,
  receiverAmount: '1000000000',
  proofs: [
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    '9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  ],
  createdAt: new Date(),
  isClaimed: true,
}

const mockGiftClaim = giftClaimFactory({
  giftIdHash: 'mock-hash',
  contractAddress: mockUser.contractAddress as string,
})

const mockGiftId = 'test-gift-id'
const mockChallenge = 'mock-challenge-data'
const mockOptions = '{"challenge":"mock-challenge","userVerification":"required"}'

const mockedUserRepository = mockUserRepository()
const mockedProofRepository = mockProofRepository()
const mockedGiftReservationRepository = mockGiftReservationRepository()
const mockedWebAuthnAuthentication = mockWebAuthnAuthentication()
const mockedSorobanService = mockSorobanService()
const mockedGiftEligibilityService = mockGiftEligibilityService()

let useCase: GiftOptions

describe('GiftOptions', () => {
  it('should export endpoint', () => {
    expect(endpoint).toBe('/gift/options')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GiftOptions(
      mockedProofRepository,
      mockedUserRepository,
      mockedGiftReservationRepository,
      mockedWebAuthnAuthentication,
      mockedSorobanService,
      mockedGiftEligibilityService
    )

    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
    mockedGiftReservationRepository.reserveGift.mockResolvedValue(mockGiftClaim)
    vi.mocked(mockedGiftEligibilityService.checkGiftEligibility).mockResolvedValue(true)
    mockedSorobanService.simulateContractOperation
      .mockResolvedValueOnce({
        simulationResponse: {
          result: {
            retval: nativeToScVal(false, { type: 'bool' }),
          },
        } as rpc.Api.SimulateTransactionSuccessResponse,
        tx: { hash: 'mock-tx-hash' } as unknown as Transaction,
      })
      .mockResolvedValueOnce({
        simulationResponse: { id: 'claim-simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
        tx: { hash: 'claim-tx-hash' } as unknown as Transaction,
      })
    mockedSorobanService.generateWebAuthnChallenge.mockResolvedValue(mockChallenge)
    mockedWebAuthnAuthentication.generateOptions.mockResolvedValue(mockOptions)
  })

  describe('executeHttp', () => {
    it('should return gift options successfully', async () => {
      const mockedRequest = {
        query: { giftId: mockGiftId },
        userData: { email: mockUser.email },
      } as unknown as Request

      const mockedResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await useCase.executeHttp(mockedRequest, mockedResponse)

      expect(mockedResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(mockedResponse.json).toHaveBeenCalledWith({
        data: {
          options_json: mockOptions,
          user: {
            email: mockUser.email,
            address: mockUser.contractAddress,
          },
        },
        message: 'Retrieved gift claim options successfully',
      })
    })

    it('should throw unauthorized error when email is missing', async () => {
      const requestWithoutEmail = {
        query: { giftId: mockGiftId },
        userData: {},
      } as unknown as Request

      const mockedResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(requestWithoutEmail, mockedResponse)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('handle', () => {
    it('should handle gift options request successfully', async () => {
      const payload = {
        email: mockUser.email,
        giftId: mockGiftId,
      }

      const result = await useCase.handle(payload)

      expect(result.data.options_json).toBe(mockOptions)
      expect(result.data.user.email).toBe(mockUser.email)
      expect(result.data.user.address).toBe(mockUser.contractAddress)
      expect(result.message).toBe('Retrieved gift claim options successfully')

      expect(mockedGiftEligibilityService.checkGiftEligibility).toHaveBeenCalledWith(mockGiftId)
      expect(mockedGiftReservationRepository.reserveGift).toHaveBeenCalledWith(mockGiftId, mockUser.contractAddress)
      expect(mockedProofRepository.findByAddressAndContract).toHaveBeenCalledWith(
        mockUser.contractAddress,
        STELLAR.GIFT_AIRDROP_CONTRACT_ADDRESS
      )

      expect(mockedSorobanService.simulateContractOperation).toHaveBeenNthCalledWith(1, {
        contractId: STELLAR.GIFT_AIRDROP_CONTRACT_ADDRESS,
        method: 'is_claimed',
        args: [nativeToScVal(mockProof.index, { type: 'u32' })],
      })

      expect(mockedSorobanService.simulateContractOperation).toHaveBeenNthCalledWith(2, {
        contractId: STELLAR.GIFT_AIRDROP_CONTRACT_ADDRESS,
        method: 'claim',
        args: expect.arrayContaining([
          nativeToScVal(mockProof.index, { type: 'u32' }),
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
        ]),
      })

      expect(mockedSorobanService.generateWebAuthnChallenge).toHaveBeenCalledWith({
        contractId: STELLAR.GIFT_AIRDROP_CONTRACT_ADDRESS,
        simulationResponse: expect.any(Object),
        signer: {
          addressId: mockUser.contractAddress,
        },
      })

      expect(mockedWebAuthnAuthentication.generateOptions).toHaveBeenCalledWith({
        type: 'raw',
        user: mockUser,
        customChallenge: mockChallenge,
        customMetadata: {
          type: 'soroban',
          tx: expect.any(Object),
          simulationResponse: expect.any(Object),
        },
      })
    })

    it('should throw error when user not found', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when user has no wallet', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue({
        ...mockUser,
        contractAddress: null,
      } as unknown as typeof mockUser)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when user has no passkeys', async () => {
      const userWithoutPasskeys = userFactory({
        ...mockUser,
        passkeys: [],
      })
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when gift verification does not exist', async () => {
      vi.mocked(mockedGiftEligibilityService.checkGiftEligibility).mockResolvedValue(false)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when gift has already been claimed by another address', async () => {
      mockedGiftReservationRepository.reserveGift.mockResolvedValue(null)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
        })
      ).rejects.toThrow(ResourceConflictedException)
    })

    it('should throw error when gift proof not found', async () => {
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(null)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when gift has already been claimed onchain', async () => {
      mockedSorobanService.simulateContractOperation.mockReset()
      mockedSorobanService.simulateContractOperation.mockResolvedValueOnce({
        simulationResponse: {
          result: {
            retval: nativeToScVal(true, { type: 'bool' }),
          },
        } as rpc.Api.SimulateTransactionSuccessResponse,
        tx: { hash: 'mock-tx-hash' } as unknown as Transaction,
      })

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })
  })
})
