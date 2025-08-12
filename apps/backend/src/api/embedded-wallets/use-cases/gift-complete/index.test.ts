import { rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { Proof } from 'api/core/entities/proof/model'
import { userFactory } from 'api/core/entities/user/factory'
import { submitTx } from 'api/core/helpers/submit-tx'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockGiftReservationRepository } from 'api/core/services/gift-claim/mocks'
import { mockProofRepository } from 'api/core/services/proof/mocks'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { STELLAR } from 'config/stellar'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'

import { GiftComplete, endpoint } from '.'

vi.mock('api/core/helpers/submit-tx', () => ({
  submitTx: vi.fn(),
}))

const mockPasskeys = [
  passkeyFactory({
    credentialId: 'cred-1',
    transports: ['usb', 'nfc'],
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
  proofs: ['1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'],
  createdAt: new Date(),
}

const mockGiftId = 'test-gift-id'
const mockAuthResponseJson = '{"id":"credential-id","response":{"authenticatorData":"mock-data"}}'
const mockTxHash = 'mock-transaction-hash'

const mockedUserRepository = mockUserRepository()
const mockedProofRepository = mockProofRepository()
const mockedGiftReservationRepository = mockGiftReservationRepository()
const mockedWebAuthnAuthentication = mockWebAuthnAuthentication()
const mockedSorobanService = mockSorobanService()
const mockedSubmitTx = vi.mocked(submitTx)

const mockVerifyAuthResult = {
  passkey: mockPasskeys[0],
  clientDataJSON: Buffer.from('mock-client-data'),
  authenticatorData: Buffer.from('mock-auth-data'),
  compactSignature: Buffer.from('mock-signature'),
  customMetadata: {
    type: 'soroban' as const,
    tx: { hash: 'mock-tx-hash' } as unknown as Transaction,
    simulationResponse: {} as rpc.Api.SimulateTransactionSuccessResponse,
  },
}

let useCase: GiftComplete

describe('GiftComplete', () => {
  it('should export endpoint', () => {
    expect(endpoint).toBe('/gift/complete')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GiftComplete(
      mockedProofRepository,
      mockedUserRepository,
      mockedGiftReservationRepository,
      mockedWebAuthnAuthentication,
      mockedSorobanService
    )

    mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
    mockedProofRepository.findByAddressAndContract.mockResolvedValue(mockProof)
    mockedWebAuthnAuthentication.complete.mockResolvedValue(mockVerifyAuthResult)
    mockedSorobanService.signAuthEntries.mockResolvedValue({ hash: 'signed-tx-hash' } as unknown as Transaction)
    mockedSorobanService.simulateTransaction.mockResolvedValue({} as rpc.Api.SimulateTransactionSuccessResponse)
    mockedSubmitTx.mockResolvedValue({
      status: rpc.Api.GetTransactionStatus.SUCCESS,
      txHash: mockTxHash,
    } as rpc.Api.GetSuccessfulTransactionResponse)
  })

  describe('executeHttp', () => {
    it('should complete gift claim successfully', async () => {
      const mockedRequest = {
        body: {
          giftId: mockGiftId,
          authentication_response_json: mockAuthResponseJson,
        },
        userData: { email: mockUser.email },
      } as Request

      const mockedResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await useCase.executeHttp(mockedRequest, mockedResponse)

      expect(mockedResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(mockedResponse.json).toHaveBeenCalledWith({
        data: {
          hash: mockTxHash,
        },
        message: 'Gift claimed successfully',
      })
    })

    it('should throw unauthorized error when email is missing', async () => {
      const requestWithoutEmail = {
        body: {
          giftId: mockGiftId,
          authentication_response_json: mockAuthResponseJson,
        },
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
    it('should handle gift complete request successfully', async () => {
      const result = await useCase.handle({
        email: mockUser.email,
        giftId: mockGiftId,
        authentication_response_json: mockAuthResponseJson,
      })

      expect(result).toEqual({
        data: {
          hash: mockTxHash,
        },
        message: 'Gift claimed successfully',
      })

      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith(mockUser.email, { relations: ['passkeys'] })
      expect(mockedProofRepository.findByAddressAndContract).toHaveBeenCalledWith(
        mockUser.contractAddress,
        STELLAR.GIFT_AIRDROP_CONTRACT_ADDRESS
      )
      expect(mockedWebAuthnAuthentication.complete).toHaveBeenCalledWith({
        type: 'raw',
        user: mockUser,
        authenticationResponseJSON: mockAuthResponseJson,
      })
      expect(mockedSorobanService.signAuthEntries).toHaveBeenCalled()
      expect(mockedSubmitTx).toHaveBeenCalled()
    })

    it('should throw error when user not found', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
          authentication_response_json: mockAuthResponseJson,
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
          authentication_response_json: mockAuthResponseJson,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when gift proof not found', async () => {
      mockedProofRepository.findByAddressAndContract.mockResolvedValue(null)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
          authentication_response_json: mockAuthResponseJson,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when WebAuthn authentication fails', async () => {
      mockedWebAuthnAuthentication.complete.mockResolvedValue(false)

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
          authentication_response_json: mockAuthResponseJson,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })

    it('should throw error when custom metadata is invalid', async () => {
      mockedWebAuthnAuthentication.complete.mockResolvedValue({
        ...mockVerifyAuthResult,
        customMetadata: undefined,
      })

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
          authentication_response_json: mockAuthResponseJson,
        })
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw error when transaction submission fails', async () => {
      mockedSubmitTx.mockResolvedValue({
        status: rpc.Api.GetTransactionStatus.FAILED,
      } as rpc.Api.GetSuccessfulTransactionResponse & { status: rpc.Api.GetTransactionStatus.FAILED })

      await expect(
        useCase.handle({
          email: mockUser.email,
          giftId: mockGiftId,
          authentication_response_json: mockAuthResponseJson,
        })
      ).rejects.toThrow(ResourceNotFoundException)
    })
  })
})
