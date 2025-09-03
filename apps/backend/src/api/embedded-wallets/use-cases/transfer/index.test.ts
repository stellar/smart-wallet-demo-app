import { rpc, Transaction } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { assetFactory } from 'api/core/entities/asset/factory'
import { passkeyFactory } from 'api/core/entities/passkey/factory'
import { userFactory } from 'api/core/entities/user/factory'
import { UserProduct } from 'api/core/entities/user-product/types'
import { mockWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/mocks'
import { mockAssetRepository } from 'api/core/services/asset/mock'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { mockUserProductRepository } from 'api/core/services/user-product/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { TransferTypes } from 'api/embedded-wallets/use-cases/transfer-options/types'
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

const mockAsset = assetFactory({
  assetId: 'asset-1',
  code: 'USDC',
  contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  type: 'token',
})
const mockSwagAsset = assetFactory({
  code: 'SWAG',
  type: 'token',
  contractAddress: 'CADJUKNJVG3HYITS5VQB3TJ2F3XPJCPPAYU3ETAFHRGC75ROWLY72CU2',
})

const mockSimulationResponse = { id: 'simulation-id' } as unknown as rpc.Api.SimulateTransactionSuccessResponse

const mockTransaction = {
  toXDR: vi.fn().mockReturnValue('mock-xdr'),
} as unknown as Transaction

const mockAuthenticationResponse = {
  passkey: mockPasskeys[0],
  clientDataJSON: Buffer.from('client-data-json'),
  authenticatorData: Buffer.from('authenticator-data'),
  compactSignature: Buffer.from('compact-signature'),
  customMetadata: {
    type: 'soroban' as const,
    tx: mockTransaction,
    simulationResponse: mockSimulationResponse,
  },
}

const mockTxResponse = {
  status: rpc.Api.GetTransactionStatus.SUCCESS,
  txHash: 'mock-tx-hash-123',
} as unknown as rpc.Api.GetSuccessfulTransactionResponse

const mockedUserRepository = mockUserRepository()
const mockedAssetRepository = mockAssetRepository()
const mockedUserProductRepository = mockUserProductRepository()
const mockedWebauthnAuthenticationHelper = mockWebAuthnAuthentication()
const mockedSorobanService = mockSorobanService()

mockedWebauthnAuthenticationHelper.complete = vi.fn()
mockedSorobanService.signAuthEntries = vi.fn()
mockedSorobanService.simulateTransaction = vi.fn()

let useCase: Transfer

describe('Transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the complete authentication method to return the expected structure
    mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(mockAuthenticationResponse)

    // Mock the simulateContractOperation method
    mockedSorobanService.signAuthEntries.mockResolvedValue({ hash: 'test-tx-hash' } as unknown as Transaction)

    useCase = new Transfer(
      mockedUserRepository,
      mockedAssetRepository,
      mockedUserProductRepository,
      undefined, // nftRepository
      mockedWebauthnAuthenticationHelper,
      mockedSorobanService
    )
  })

  describe('handle', () => {
    it('should successfully transfer assets', async () => {
      const payload: {
        email: string
        type: TransferTypes.TRANSFER
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: mockUser.email,
        type: TransferTypes.TRANSFER,
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 100,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetsByCode.mockResolvedValue([mockAsset])
      mockedSorobanService.signAuthEntries.mockResolvedValue(mockTransaction)
      mockedSorobanService.simulateTransaction.mockResolvedValue(mockSimulationResponse)
      mockedSubmitTx.mockResolvedValue(mockTxResponse)

      const result = await useCase.handle(payload)

      expect(result.data.hash).toBe('mock-tx-hash-123')
      expect(result.message).toBe('Transaction executed successfully')
      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith(mockUser.email, { relations: ['passkeys'] })
      expect(mockedWebauthnAuthenticationHelper.complete).toHaveBeenCalledWith({
        type: 'raw',
        user: mockUser,
        authenticationResponseJSON: payload.authentication_response_json,
      })
      expect(mockedAssetRepository.getAssetsByCode).toHaveBeenCalledWith(['USDC'])
      expect(mockedSorobanService.signAuthEntries).toHaveBeenCalledWith({
        contractId: mockAsset.contractAddress,
        tx: mockTransaction,
        simulationResponse: { id: 'simulation-id' },
        signers: [
          {
            addressId: mockUser.contractAddress,
            methodOptions: {
              method: 'webauthn',
              options: {
                clientDataJSON: mockAuthenticationResponse.clientDataJSON,
                authenticatorData: mockAuthenticationResponse.authenticatorData,
                signature: mockAuthenticationResponse.compactSignature,
              },
            },
          },
        ],
      })
      expect(mockedSubmitTx).toHaveBeenCalled()
    })

    it('should successfully transfer swag asset and update user product', async () => {
      const payload: {
        email: string
        type: TransferTypes.SWAG
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: mockUser.email,
        type: TransferTypes.SWAG,
        asset: 'SWAG',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 1,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetsByCode.mockResolvedValue([mockSwagAsset])
      mockedSorobanService.signAuthEntries.mockResolvedValue(mockTransaction)
      mockedSorobanService.simulateTransaction.mockResolvedValue(mockSimulationResponse)
      mockedSubmitTx.mockResolvedValue(mockTxResponse)
      mockedUserProductRepository.getUserProductsByUserContractAddressAndAssetCode.mockResolvedValue([
        {
          status: 'unclaimed',
          claimedAt: undefined,
        } as UserProduct,
      ])
      mockedUserProductRepository.saveUserProducts.mockResolvedValue([
        {
          status: 'claimed',
          claimedAt: new Date(),
        } as UserProduct,
      ])

      const result = await useCase.handle(payload)

      expect(result.data.hash).toBe('mock-tx-hash-123')
      expect(result.message).toBe('Transaction executed successfully')
      expect(mockedUserRepository.getUserByEmail).toHaveBeenCalledWith(mockUser.email, { relations: ['passkeys'] })
      expect(mockedWebauthnAuthenticationHelper.complete).toHaveBeenCalledWith({
        type: 'raw',
        user: mockUser,
        authenticationResponseJSON: payload.authentication_response_json,
      })
      expect(mockedAssetRepository.getAssetsByCode).toHaveBeenCalledWith(['SWAG'])
      expect(mockedSorobanService.signAuthEntries).toHaveBeenCalledWith({
        contractId: mockSwagAsset.contractAddress,
        tx: mockTransaction,
        simulationResponse: { id: 'simulation-id' },
        signers: [
          {
            addressId: mockUser.contractAddress,
            methodOptions: {
              method: 'webauthn',
              options: {
                clientDataJSON: mockAuthenticationResponse.clientDataJSON,
                authenticatorData: mockAuthenticationResponse.authenticatorData,
                signature: mockAuthenticationResponse.compactSignature,
              },
            },
          },
        ],
      })
      expect(mockedSubmitTx).toHaveBeenCalled()
      expect(mockedUserProductRepository.saveUserProducts).toHaveBeenCalled()
    })

    it('should throw ResourceNotFoundException when asset not found in database', async () => {
      const payload: {
        email: string
        type: TransferTypes.TRANSFER
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: mockUser.email,
        type: TransferTypes.TRANSFER,
        asset: 'XLM',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 100,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetsByCode.mockResolvedValue([])
      mockedAssetRepository.getAssetsByContractAddress.mockResolvedValue([])

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      await expect(useCase.handle(payload)).rejects.toThrow('The requested resource was not found')
      expect(mockedAssetRepository.getAssetsByCode).toHaveBeenCalledWith(['XLM'])
    })

    it('should throw ResourceNotFoundException when user does not exist', async () => {
      const payload: {
        email: string
        type: TransferTypes.TRANSFER
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: 'notfound@example.com',
        type: TransferTypes.TRANSFER,
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 100,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      expect(mockedWebauthnAuthenticationHelper.complete).not.toHaveBeenCalled()
    })

    it('should throw ResourceNotFoundException when user has no passkeys', async () => {
      const userWithoutPasskeys = userFactory({
        email: 'test@example.com',
        contractAddress: 'GA223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        passkeys: [],
      })

      const payload: {
        email: string
        type: TransferTypes.TRANSFER
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: userWithoutPasskeys.email,
        type: TransferTypes.TRANSFER,
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 100,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithoutPasskeys)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      expect(mockedWebauthnAuthenticationHelper.complete).not.toHaveBeenCalled()
    })

    it('should throw ResourceNotFoundException when authentication fails', async () => {
      const payload: {
        email: string
        type: TransferTypes.TRANSFER
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: mockUser.email,
        type: TransferTypes.TRANSFER,
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 100,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(false)

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(ResourceNotFoundException)
      await expect(useCase.handle(payload)).rejects.toThrow('The requested resource was not found')
      expect(mockedAssetRepository.getAssetsByCode).toHaveBeenCalledWith(['USDC'])
    })

    it('should throw Error when transaction execution fails', async () => {
      const payload: {
        email: string
        type: TransferTypes.TRANSFER
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: mockUser.email,
        type: TransferTypes.TRANSFER,
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 100,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetsByCode.mockResolvedValue([mockAsset])
      mockedSorobanService.signAuthEntries.mockResolvedValue(mockTransaction)
      mockedSorobanService.simulateTransaction.mockResolvedValue(mockSimulationResponse)
      mockedSubmitTx.mockResolvedValue({
        ...mockTxResponse,
        status: rpc.Api.GetTransactionStatus.FAILED,
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(useCase.handle(payload)).rejects.toThrow('The requested resource was not found')
    })

    it('should throw Error when submitTx returns null', async () => {
      const payload: {
        email: string
        type: TransferTypes.TRANSFER
        asset: string
        to: string
        amount: number
        authentication_response_json: string
      } = {
        email: mockUser.email,
        type: TransferTypes.TRANSFER,
        asset: 'USDC',
        to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
        amount: 100,
        authentication_response_json: '{"id":"TestPayload123"}',
      }

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetsByCode.mockResolvedValue([mockAsset])
      mockedSorobanService.signAuthEntries.mockResolvedValue(mockTransaction)
      mockedSorobanService.simulateTransaction.mockResolvedValue(mockSimulationResponse)
      mockedSubmitTx.mockResolvedValue(null as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(useCase.handle(payload)).rejects.toThrow('The requested resource was not found')
    })
  })

  describe('executeHttp', () => {
    it('should return correct response when transfer succeeds', async () => {
      const req = {
        userData: { email: mockUser.email },
        body: {
          type: TransferTypes.TRANSFER,
          asset: 'USDC',
          to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
          amount: 100,
          authentication_response_json: '{"id":"TestPayload123"}',
        },
      } as unknown as Request

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response

      mockedUserRepository.getUserByEmail.mockResolvedValue(mockUser)
      mockedWebauthnAuthenticationHelper.complete.mockResolvedValue(mockAuthenticationResponse)
      mockedAssetRepository.getAssetsByCode.mockResolvedValue([mockAsset])
      mockedSorobanService.signAuthEntries.mockResolvedValue(mockTransaction)
      mockedSorobanService.simulateTransaction.mockResolvedValue(mockSimulationResponse)
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
          type: TransferTypes.TRANSFER,
          asset: 'USDC',
          to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
          amount: 100,
          authentication_response_json: '{"id":"TestPayload123"}',
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
          type: TransferTypes.TRANSFER,
          asset: 'USDC',
          to: 'GB223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG',
          amount: 100,
          authentication_response_json: '{"id":"TestPayload123"}',
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
