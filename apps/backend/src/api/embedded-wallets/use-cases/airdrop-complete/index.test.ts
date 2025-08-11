import { rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { Proof } from 'api/core/entities/proof/model'
import { userFactory } from 'api/core/entities/user/factory'
import { submitTx } from 'api/core/helpers/submit-tx'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockProofRepository } from 'api/core/services/proof/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { STELLAR } from 'config/stellar'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'

import { AirdropComplete, endpoint } from '.'

vi.mock('api/core/helpers/submit-tx', () => ({
  submitTx: vi.fn(),
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
  contractAddress: 'CCXTP3MIXUFBVEL7Z6MTMW3S325UO2YH5FZMSWUR3QSV5KXVABMTD75D',
  passkeys: mockPasskeys,
})

const mockProof: Proof = {
  receiverAddress: 'CCXTP3MIXUFBVEL7Z6MTMW3S325UO2YH5FZMSWUR3QSV5KXVABMTD75D',
  contractAddress: STELLAR.AIRDROP_CONTRACT_ADDRESS,
  index: 123,
  receiverAmount: '1000000000',
  proofs: [
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    '9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  ],
  createdAt: new Date(),
}

const mockAuthResponse = JSON.stringify({
  id: 'credential-id',
  rawId: 'raw-credential-id',
  response: {
    authenticatorData: 'mock-auth-data',
    clientDataJSON: 'mock-client-data',
    signature: 'mock-signature',
  },
  type: 'public-key',
})

const mockVerifyAuthResult = {
  clientDataJSON: 'mock-client-data-json',
  authenticatorData: 'mock-authenticator-data',
  compactSignature: 'mock-compact-signature',
  customMetadata: {
    type: 'soroban',
    tx: { hash: 'mock-tx-hash' } as unknown as Transaction,
    simulationResponse: { id: 'mock-simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse,
  },
}

const mockTxResponse = {
  status: rpc.Api.GetTransactionStatus.SUCCESS,
  txHash: 'successful-tx-hash',
} as unknown as rpc.Api.GetSuccessfulTransactionResponse

const mockedUserRepository = mockUserRepository()
const mockedProofRepository = mockProofRepository()
const mockedWebauthnAuthenticationHelper = mockWebAuthnAuthentication()
const mockedSorobanService = mockSorobanService()

const mockedComplete = vi.fn()
const mockedSignAuthEntries = vi.fn()
const mockedSimulateTransaction = vi.fn()

mockedWebauthnAuthenticationHelper.complete = mockedComplete
mockedSorobanService.signAuthEntries = mockedSignAuthEntries
mockedSorobanService.simulateTransaction = mockedSimulateTransaction

let useCase: AirdropComplete

describe('AirdropComplete', () => {
  it('should export endpoint', () => {
    expect(endpoint).toBe('/airdrop/complete')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new AirdropComplete(
      mockedProofRepository,
      mockedUserRepository,
      mockedWebauthnAuthenticationHelper,
      mockedSorobanService
    )
  })

  describe('handle', () => {
    it('should complete airdrop claim successfully', async () => {
      const payload = {
        email: mockUser.email,
        authentication_response_json: mockAuthResponse,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedComplete.mockResolvedValue(mockVerifyAuthResult)

      const signedTx = { hash: 'signed-tx-hash' } as unknown as Transaction
      mockedSignAuthEntries.mockResolvedValue(signedTx)

      const simulationResponse = { id: 'final-simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse
      mockedSimulateTransaction.mockResolvedValue(simulationResponse)

      vi.mocked(submitTx).mockResolvedValue(mockTxResponse)

      const result = await useCase.handle(payload)

      expect(result).toEqual({
        data: {
          hash: mockTxResponse.txHash,
        },
        message: 'Airdrop claimed successfully',
      })

      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith(mockUser.email, { relations: ['passkeys'] })

      expect(mockedProofRepository.findByAddressAndContract).toHaveBeenCalledWith(
        mockUser.contractAddress,
        STELLAR.AIRDROP_CONTRACT_ADDRESS
      )

      expect(mockedComplete).toHaveBeenCalledWith({
        type: 'raw',
        user: mockUser,
        authenticationResponseJSON: mockAuthResponse,
      })

      expect(mockedSignAuthEntries).toHaveBeenCalledWith({
        contractId: STELLAR.AIRDROP_CONTRACT_ADDRESS,
        tx: mockVerifyAuthResult.customMetadata.tx,
        simulationResponse: mockVerifyAuthResult.customMetadata.simulationResponse,
        signers: [
          {
            addressId: mockUser.contractAddress,
            methodOptions: {
              method: 'webauthn',
              options: {
                clientDataJSON: mockVerifyAuthResult.clientDataJSON,
                authenticatorData: mockVerifyAuthResult.authenticatorData,
                signature: mockVerifyAuthResult.compactSignature,
              },
            },
          },
        ],
      })

      expect(mockedSimulateTransaction).toHaveBeenCalledWith(signedTx)

      expect(submitTx).toHaveBeenCalledWith({
        tx: signedTx,
        simulationResponse,
      })
    })

    it('should throw ZodValidationException when email is not provided', async () => {
      const payload = {
        email: '',
        authentication_response_json: mockAuthResponse,
      }

      await expect(useCase.handle(payload)).rejects.toThrow('The payload has validation errors')
    })

    it('should throw ResourceNotFoundException when user is not found', async () => {
      const payload = {
        email: 'nonexistent@example.com',
        authentication_response_json: mockAuthResponse,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when user has no contract address', async () => {
      const payload = {
        email: mockUser.email,
        authentication_response_json: mockAuthResponse,
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
        authentication_response_json: mockAuthResponse,
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
        authentication_response_json: mockAuthResponse,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when WebAuthn authentication fails', async () => {
      const payload = {
        email: mockUser.email,
        authentication_response_json: mockAuthResponse,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedComplete.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw BadRequestException when custom metadata is missing', async () => {
      const payload = {
        email: mockUser.email,
        authentication_response_json: mockAuthResponse,
      }

      const verifyAuthWithoutMetadata = {
        ...mockVerifyAuthResult,
        customMetadata: null,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedComplete.mockResolvedValue(verifyAuthWithoutMetadata)

      await expect(useCase.handle(payload)).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when custom metadata type is not soroban', async () => {
      const payload = {
        email: mockUser.email,
        authentication_response_json: mockAuthResponse,
      }

      const verifyAuthWithWrongMetadata = {
        ...mockVerifyAuthResult,
        customMetadata: {
          type: 'other',
          tx: mockVerifyAuthResult.customMetadata.tx,
          simulationResponse: mockVerifyAuthResult.customMetadata.simulationResponse,
        },
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedComplete.mockResolvedValue(verifyAuthWithWrongMetadata)

      await expect(useCase.handle(payload)).rejects.toThrow(BadRequestException)
    })

    it('should throw ResourceNotFoundException when transaction execution fails', async () => {
      const payload = {
        email: mockUser.email,
        authentication_response_json: mockAuthResponse,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedComplete.mockResolvedValue(mockVerifyAuthResult)

      const signedTx = { hash: 'signed-tx-hash' } as unknown as Transaction
      mockedSignAuthEntries.mockResolvedValue(signedTx)

      const simulationResponse = { id: 'final-simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse
      mockedSimulateTransaction.mockResolvedValue(simulationResponse)

      const failedTxResponse = {
        status: rpc.Api.GetTransactionStatus.FAILED,
        txHash: 'failed-tx-hash',
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse
      vi.mocked(submitTx).mockResolvedValue(failedTxResponse)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw ResourceNotFoundException when transaction response is null', async () => {
      const payload = {
        email: mockUser.email,
        authentication_response_json: mockAuthResponse,
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedComplete.mockResolvedValue(mockVerifyAuthResult)

      const signedTx = { hash: 'signed-tx-hash' } as unknown as Transaction
      mockedSignAuthEntries.mockResolvedValue(signedTx)

      const simulationResponse = { id: 'final-simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse
      mockedSimulateTransaction.mockResolvedValue(simulationResponse)

      vi.mocked(submitTx).mockResolvedValue(null as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(useCase.handle(payload)).rejects.toThrow(ResourceNotFoundException)
    })
  })

  describe('executeHttp', () => {
    it('should handle HTTP request and return success response', async () => {
      const mockRequest = {
        body: {
          authentication_response_json: mockAuthResponse,
        },
        userData: { email: mockUser.email },
      } as Request

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
      mockedComplete.mockResolvedValue(mockVerifyAuthResult)

      const signedTx = { hash: 'signed-tx-hash' } as unknown as Transaction
      mockedSignAuthEntries.mockResolvedValue(signedTx)

      const simulationResponse = { id: 'final-simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse
      mockedSimulateTransaction.mockResolvedValue(simulationResponse)

      vi.mocked(submitTx).mockResolvedValue(mockTxResponse)

      await useCase.executeHttp(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: {
          hash: mockTxResponse.txHash,
        },
        message: 'Airdrop claimed successfully',
      })
    })

    it('should throw UnauthorizedException when no user data in request', async () => {
      const mockRequest = {
        body: {
          authentication_response_json: mockAuthResponse,
        },
        userData: undefined,
      } as Request

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(mockRequest, mockResponse)).rejects.toThrow(UnauthorizedException)
    })
  })
})
