import { rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { assetFactory } from 'api/core/entities/asset/factory'
import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockAssetRepository } from 'api/core/services/asset/mock'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'

import { Transfer, endpoint } from '.'

// Mock the submitTx helper
const mockedSubmitTx = vi.fn()
vi.mock('api/core/helpers/submit-tx', () => ({
  submitTx: () => mockedSubmitTx(),
}))

// Mock ScConvert to avoid stellar-sdk address validation issues
vi.mock('interfaces/soroban/helpers/sc-convert', () => ({
  ScConvert: {
    accountIdToScVal: vi.fn().mockReturnValue('mock-sc-val'),
    stringToScVal: vi.fn().mockReturnValue('mock-string-sc-val'),
    stringToPaddedString: vi.fn().mockReturnValue('mock-padded-string'),
  },
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
  contractAddress: 'GA223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
  passkeys: mockPasskeys,
})

const mockAuthenticationResponse = {
  passkey: { credentialId: 'cred-1' },
  clientDataJSON: 'client-data-json',
  authenticatorData: 'authenticator-data',
  compactSignature: 'compact-signature',
}

const mockAsset = assetFactory({
  assetId: 'asset-1',
  code: 'USDC',
  contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  type: 'token',
})

const mockSimulationResponse = { id: 'simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse

const mockTransaction = {
  toXDR: vi.fn().mockReturnValue('mock-xdr'),
} as unknown as Transaction

const mockTxResponse = {
  status: rpc.Api.GetTransactionStatus.SUCCESS,
  txHash: 'mock-tx-hash-123',
} as unknown as rpc.Api.GetSuccessfulTransactionResponse

const mockedUserRepository = mockUserRepository()
const mockedAssetRepository = mockAssetRepository()
const mockedWebauthnAuthenticationHelper = mockWebAuthnAuthentication()
const mockedSorobanService = mockSorobanService()

const mockedCompleteAuthentication = vi.fn()
mockedWebauthnAuthenticationHelper.complete = mockedCompleteAuthentication

const mockedSimulateContract = vi.fn()
mockedSorobanService.simulateContract = mockedSimulateContract

let useCase: Transfer

describe('Transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new Transfer(
      mockedUserRepository,
      mockedAssetRepository,
      mockedWebauthnAuthenticationHelper,
      mockedSorobanService
    )
  })

  describe('handle', () => {
    it('should successfully transfer assets', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer',
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: '100',
        authenticationResponseJSON: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedCompleteAuthentication.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedSimulateContract.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })
      mockedSubmitTx.mockResolvedValue(mockTxResponse)

      const result = await useCase.handle(payload)

      expect(result.data.hash).toBe('mock-tx-hash-123')
      expect(result.message).toBe('Transaction executed successfully')
      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith(mockUser.email, { relations: ['passkeys'] })
      expect(mockedCompleteAuthentication).toHaveBeenCalledWith({
        user: mockUser,
        authenticationResponseJSON: payload.authenticationResponseJSON,
      })
      expect(mockedAssetRepository.getAssetByCode).toHaveBeenCalledWith('USDC')
      expect(mockedSimulateContract).toHaveBeenCalledWith({
        contractId: mockAsset.contractAddress,
        method: 'transfer',
        args: expect.any(Array),
        signers: [
          {
            addressId: mockUser.contractAddress,
            methodOptions: {
              method: 'webauthn',
              options: {
                credentialId: mockAuthenticationResponse.passkey.credentialId,
                clientDataJSON: mockAuthenticationResponse.clientDataJSON,
                authenticatorData: mockAuthenticationResponse.authenticatorData,
                compactSignature: mockAuthenticationResponse.compactSignature,
              },
            },
          },
        ],
      })
      expect(mockedSubmitTx).toHaveBeenCalled()
    })

    it('should use native token contract when asset not found in database', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer',
        asset: 'XLM',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: '100',
        authenticationResponseJSON: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedCompleteAuthentication.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(null)
      mockedSimulateContract.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })
      mockedSubmitTx.mockResolvedValue(mockTxResponse)

      const result = await useCase.handle(payload)

      expect(result.data.hash).toBe('mock-tx-hash-123')
      expect(mockedAssetRepository.getAssetByCode).toHaveBeenCalledWith('XLM')
      expect(mockedSimulateContract).toHaveBeenCalledWith({
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', // Native token contract
        method: 'transfer',
        args: expect.any(Array),
        signers: expect.any(Array),
      })
    })

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      const payload = {
        email: 'notfound@example.com',
        type: 'transfer',
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: '100',
        authenticationResponseJSON: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      expect(mockedCompleteAuthentication).not.toHaveBeenCalled()
    })

    it('should throw ResourceNotFoundException when user has no passkeys', async () => {
      const userWithoutPasskeys = userFactory({
        email: 'test@example.com',
        contractAddress: 'GA223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        passkeys: [],
      })

      const payload = {
        email: userWithoutPasskeys.email,
        type: 'transfer',
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: '100',
        authenticationResponseJSON: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      expect(mockedCompleteAuthentication).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException when authentication fails', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer',
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: '100',
        authenticationResponseJSON: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedCompleteAuthentication.mockResolvedValue(false)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(UnauthorizedException)
      expect(mockedAssetRepository.getAssetByCode).not.toHaveBeenCalled()
    })

    it('should throw Error when transaction execution fails', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer',
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: '100',
        authenticationResponseJSON: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedCompleteAuthentication.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedSimulateContract.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })
      mockedSubmitTx.mockResolvedValue({
        ...mockTxResponse,
        status: rpc.Api.GetTransactionStatus.FAILED,
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(useCase.handle(payload)).rejects.toThrow(messages.UNABLE_TO_EXECUTE_TRANSACTION)
    })

    it('should throw Error when submitTx returns null', async () => {
      const payload = {
        email: mockUser.email,
        type: 'transfer',
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: '100',
        authenticationResponseJSON: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedCompleteAuthentication.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedSimulateContract.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })
      mockedSubmitTx.mockResolvedValue(null as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(useCase.handle(payload)).rejects.toThrow(messages.UNABLE_TO_EXECUTE_TRANSACTION)
    })
  })

  describe('executeHttp', () => {
    it('should return correct response when transfer succeeds', async () => {
      const req = {
        userData: { email: mockUser.email },
        body: {
          type: 'transfer',
          asset: 'USDC',
          to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
          amount: '100',
          authenticationResponseJSON: '{"id":"TestPayload123"}',
        },
      } as unknown as Request

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedCompleteAuthentication.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetByCode.mockResolvedValue(mockAsset)
      mockedSimulateContract.mockResolvedValue({
        tx: mockTransaction,
        simulationResponse: mockSimulationResponse,
      })
      mockedSubmitTx.mockResolvedValue(mockTxResponse)

      await useCase.executeHttp(req, res)

      expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(res.json).toHaveBeenCalledWith({
        data: {
          hash: 'mock-tx-hash-123',
        },
        message: 'Transaction executed successfully',
      })
    })

    it('should throw UnauthorizedException when user email is missing', async () => {
      const req = {
        userData: {},
        body: {
          type: 'transfer',
          asset: 'USDC',
          to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
          amount: '100',
          authenticationResponseJSON: '{"id":"TestPayload123"}',
        },
      } as unknown as Request

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(req, res)).rejects.toBeInstanceOf(UnauthorizedException)
      await expect(useCase.executeHttp(req, res)).rejects.toThrow("You don't have permission to do this action")
    })

    it('should throw UnauthorizedException when userData is missing', async () => {
      const req = {
        body: {
          type: 'transfer',
          asset: 'USDC',
          to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
          amount: '100',
          authenticationResponseJSON: '{"id":"TestPayload123"}',
        },
      } as unknown as Request

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      await expect(useCase.executeHttp(req, res)).rejects.toBeInstanceOf(UnauthorizedException)
      await expect(useCase.executeHttp(req, res)).rejects.toThrow("You don't have permission to do this action")
    })
  })

  describe('endpoint', () => {
    it('should export the correct endpoint', () => {
      expect(endpoint).toBe('/transfer/complete')
    })
  })
})
