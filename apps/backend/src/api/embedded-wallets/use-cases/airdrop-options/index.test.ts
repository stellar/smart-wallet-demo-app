import { nativeToScVal, rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { Proof } from 'api/core/entities/proof/model'
import { userFactory } from 'api/core/entities/user/factory'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockProofRepository } from 'api/core/services/proof/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'

import { AirdropOptions, endpoint } from '.'

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
  contractAddress: STELLAR.AIRDROP_CONTRACT_ADDRESS,
  index: 123,
  receiverAmount: '1000000000',
  isClaimed: false,
  proofs: [
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    '9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  ],
  createdAt: new Date(),
}

const mockChallenge = 'mock-challenge-data'
const mockOptions = '{"challenge":"mock-challenge","userVerification":"required"}'

const mockedUserRepository = mockUserRepository()
const mockedProofRepository = mockProofRepository()
const mockedWebauthnAuthenticationHelper = mockWebAuthnAuthentication()
const mockedSorobanService = mockSorobanService()

const mockedGenerateOptions = vi.fn()
const mockedGenerateWebAuthnChallenge = vi.fn()

mockedWebauthnAuthenticationHelper.generateOptions = mockedGenerateOptions
mockedSorobanService.generateWebAuthnChallenge = mockedGenerateWebAuthnChallenge

let useCase: AirdropOptions

describe('AirdropOptions', () => {
  it('should export endpoint', () => {
    expect(endpoint).toBe('/airdrop/options')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new AirdropOptions(
      mockedProofRepository,
      mockedUserRepository,
      mockedWebauthnAuthenticationHelper,
      mockedSorobanService
    )

    mockedSorobanService.simulateContractOperation
      .mockResolvedValueOnce({
        tx: { hash: 'test-tx-hash' } as unknown as Transaction,
        simulationResponse: {
          id: 'simulation-id',
          result: {
            retval: nativeToScVal(false, { type: 'bool' }),
          },
        } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
      })
      .mockResolvedValueOnce({
        tx: { hash: 'claim-tx-hash' } as unknown as Transaction,
        simulationResponse: { id: 'claim-simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
      })
  })

  describe('handle', () => {
    it('should return airdrop claim options successfully', async () => {
      const payload = {
        email: mockUser.email,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(mockOptions)

      const result = await useCase.handle(payload)

      expect(result.data.options_json).toBe(mockOptions)
      expect(result.data.user.email).toBe(mockUser.email)
      expect(result.data.user.address).toBe(mockUser.contractAddress)
      expect(result.message).toBe('Retrieved airdrop claim options successfully')

      expect(mockedProofRepository.findByAddressAndContract).toHaveBeenCalledWith(
        mockUser.contractAddress,
        STELLAR.AIRDROP_CONTRACT_ADDRESS
      )

      expect(mockedSorobanService.simulateContractOperation).toHaveBeenNthCalledWith(1, {
        contractId: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        method: 'is_claimed',
        args: [nativeToScVal(mockProof.index, { type: 'u32' })],
      })

      expect(mockedSorobanService.simulateContractOperation).toHaveBeenNthCalledWith(2, {
        contractId: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        method: 'claim',
        args: expect.arrayContaining([
          nativeToScVal(mockProof.index, { type: 'u32' }),
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
        ]),
      })

      expect(mockedGenerateWebAuthnChallenge).toHaveBeenCalledWith({
        contractId: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        simulationResponse: expect.any(Object),
        signer: {
          addressId: mockUser.contractAddress,
        },
      })

      expect(mockedGenerateOptions).toHaveBeenCalledWith({
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

    it('should throw ZodValidationException when email is not provided', async () => {
      const payload = {
        email: '',
      }

      await expect(useCase.handle(payload)).rejects.toThrow('The payload has validation errors')
    })

    it('should throw ResourceNotFoundException when user is not found', async () => {
      const payload = {
        email: 'nonexistent@example.com',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when user has no contract address', async () => {
      const payload = {
        email: mockUser.email,
      }

      const userWithoutContract = userFactory({
        email: mockUser.email,
        contractAddress: '',
        passkeys: mockUser.passkeys,
      })

      userWithoutContract.contractAddress = undefined
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutContract)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when user has no passkeys', async () => {
      const payload = {
        email: mockUser.email,
      }

      const userWithoutPasskeys = userFactory({
        email: mockUser.email,
        contractAddress: mockUser.contractAddress,
        passkeys: [],
      })
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when no proof is found', async () => {
      const payload = {
        email: mockUser.email,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when airdrop is already claimed', async () => {
      const payload = {
        email: mockUser.email,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)

      mockedSorobanService.simulateContractOperation.mockReset()
      mockedSorobanService.simulateContractOperation.mockResolvedValueOnce({
        tx: { hash: 'test-tx-hash' } as unknown as Transaction,
        simulationResponse: {
          id: 'simulation-id',
          result: {
            retval: nativeToScVal(true, { type: 'bool' }),
          },
        } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
      })

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when WebAuthn options generation fails', async () => {
      const payload = {
        email: mockUser.email,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })
  })

  describe('executeHttp', () => {
    it('should handle HTTP request and return success response', async () => {
      const mockRequest = {
        query: {},
        userData: { email: mockUser.email },
      } as unknown as Request

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedGenerateWebAuthnChallenge.mockResolvedValue(mockChallenge)
      mockedGenerateOptions.mockResolvedValue(mockOptions)

      await useCase.executeHttp(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            options_json: mockOptions,
            user: expect.objectContaining({
              email: mockUser.email,
              address: mockUser.contractAddress,
            }),
          }),
        })
      )
    })

    it('should throw UnauthorizedException when no user data in request', async () => {
      const mockRequest = {
        query: {},
        userData: undefined,
      } as unknown as Request

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(mockRequest, mockResponse)).rejects.toThrow(UnauthorizedException)
    })
  })
})
