import { rpc } from '@stellar/stellar-sdk'

import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSorobanService } from 'interfaces/soroban/mock'
import { mockWalletBackend } from 'interfaces/wallet-backend/mock'

import { CreateAccount, endpoint } from './index'

const email = 'test-email@example.com'
const testAddress = 'GCD2KGJDSC6W4WOEZYUVUWHSDLC4NKG6GFW7GP6NYE2PCE2V2XN7UOT3'

const user = userFactory({
  email,
  userId: 'test-user-id',
})

const walletBackendResponse = {
  transaction:
    'AAAAAgAAAAAuSqBGjfA/7LAYylzmDmG71S7+osSfehew6Q0UwqW4MgX14QAAAAwSAAAAIwAAAAEAAAAAAAAAAAAAAABot0i8AAAAAAAAAAEAAAABAAAAAIij+uaAFU+LDP4Q/cWyBTvZoWdaz1ctuzgQmdkf1UT6AAAAAAAAAAAUL/P6LZCom2KvC5uhnZqTK21PvwmVHsNLh0Fg/q16TgAAAAAAmJaAAAAAAAAAAALCpbgyAAAAQI93XilptmWHkWVjzlDbL4B64KSt/vNaNtvH5z3IlJ6kdw8ApzARK2QLJJSI+ZZV6Xz5J9R73wkUJpm/3xw6YgYf1UT6AAAAQKoKe/BfTHQk01aWD8EvNoHSdm3U2MSuhnh9tPfxSKwpqZ6dgGQWVOkLrAQ9Ykf5YqT5oZxKucKYc83uXRYtMQw=',
  networkPassphrase: 'Test SDF Network ; September 2015',
}

const basePayload = {
  email,
  address: testAddress,
}

const mockedUserRepository = mockUserRepository()
const mockedWalletBackend = mockWalletBackend()
const mockedSorobanService = mockSorobanService()

let useCase: CreateAccount

describe('CreateAccount', () => {
  it('should export endpoint', () => {
    expect(endpoint).toBe('/create-account')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateAccount(mockedUserRepository, mockedWalletBackend, mockedSorobanService)
  })

  describe('handle', () => {
    it('should create an account successfully', async () => {
      const testUser = { ...user, createdAccountAddress: undefined } as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(testUser)
      mockedWalletBackend.createSponsoredAccount.mockResolvedValue(walletBackendResponse)
      mockedSorobanService.sendTransaction.mockResolvedValue({
        status: rpc.Api.GetTransactionStatus.SUCCESS,
        hash: 'test-transaction-hash',
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse)
      mockedUserRepository.saveUser.mockResolvedValue(testUser)

      const result = await useCase.handle(basePayload)

      expect(result).toEqual({
        data: {
          address: testAddress,
          transaction: walletBackendResponse.transaction,
          networkPassphrase: walletBackendResponse.networkPassphrase,
        },
        message: 'Account created successfully',
      })

      expect(mockedWalletBackend.createSponsoredAccount).toHaveBeenCalledWith(testAddress)
      expect(mockedSorobanService.sendTransaction).toHaveBeenCalledWith(walletBackendResponse.transaction)
      expect(mockedUserRepository.saveUser).toHaveBeenCalledWith({
        ...testUser,
        createdAccountAddress: testAddress,
      })
    })

    it('should throw UnauthorizedException when email is missing', async () => {
      const payload = { ...basePayload, email: '' }

      await expect(useCase.handle(payload)).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('should throw validation error when address is empty', async () => {
      const payload = { ...basePayload, address: '' }

      await expect(useCase.handle(payload)).rejects.toThrow('The payload has validation errors')
    })

    it('should throw validation error when address does not start with G', async () => {
      const payload = { ...basePayload, address: 'CABC123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEF' }

      await expect(useCase.handle(payload)).rejects.toThrow('The payload has validation errors')
    })

    it('should throw ResourceNotFoundException when user is not found', async () => {
      mockedUserRepository.getUserByEmail.mockResolvedValue(null)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceNotFoundException)
    })

    it('should throw ResourceConflictedException when user already created an account', async () => {
      const userWithCreatedAccount = { ...user, createdAccountAddress: 'EXISTING_ADDRESS' } as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(userWithCreatedAccount)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceConflictedException)
    })

    it('should throw ResourceConflictedException when account already exists on network', async () => {
      const testUser = { ...user, createdAccountAddress: undefined } as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(testUser)

      const walletBackendError = {
        isAxiosError: true,
        response: { status: HttpStatusCodes.CONFLICT },
        message: 'Conflict',
      }
      mockedWalletBackend.createSponsoredAccount.mockRejectedValue(walletBackendError)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceConflictedException)
      await expect(useCase.handle(basePayload)).rejects.toThrow('The parameters conflicted with an existing resource')

      expect(mockedWalletBackend.createSponsoredAccount).toHaveBeenCalledWith(testAddress)
      expect(mockedSorobanService.sendTransaction).not.toHaveBeenCalled()
      expect(mockedUserRepository.saveUser).not.toHaveBeenCalled()
    })

    it('should throw generic error when wallet-backend fails with non-409 error', async () => {
      const testUser = { ...user, createdAccountAddress: undefined } as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(testUser)

      const walletBackendError = {
        isAxiosError: true,
        response: { status: HttpStatusCodes.INTERNAL_SERVER_ERROR },
        message: 'Server error',
      }
      mockedWalletBackend.createSponsoredAccount.mockRejectedValue(walletBackendError)

      await expect(useCase.handle(basePayload)).rejects.toThrow('Server error')

      expect(mockedWalletBackend.createSponsoredAccount).toHaveBeenCalledWith(testAddress)
      expect(mockedSorobanService.sendTransaction).not.toHaveBeenCalled()
      expect(mockedUserRepository.saveUser).not.toHaveBeenCalled()
    })

    it('should throw ResourceNotFoundException when transaction submission fails', async () => {
      const testUser = { ...user, createdAccountAddress: undefined } as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(testUser)
      mockedWalletBackend.createSponsoredAccount.mockResolvedValue(walletBackendResponse)
      mockedSorobanService.sendTransaction.mockResolvedValue({
        status: rpc.Api.GetTransactionStatus.FAILED,
        hash: 'test-transaction-hash',
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceNotFoundException)

      expect(mockedWalletBackend.createSponsoredAccount).toHaveBeenCalledWith(testAddress)
      expect(mockedSorobanService.sendTransaction).toHaveBeenCalledWith(walletBackendResponse.transaction)
      expect(mockedUserRepository.saveUser).not.toHaveBeenCalled()
    })

    it('should throw ResourceNotFoundException when transaction response is null', async () => {
      const testUser = { ...user, createdAccountAddress: undefined } as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(testUser)
      mockedWalletBackend.createSponsoredAccount.mockResolvedValue(walletBackendResponse)
      mockedSorobanService.sendTransaction.mockResolvedValue(
        null as unknown as rpc.Api.GetSuccessfulTransactionResponse
      )

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceNotFoundException)

      expect(mockedWalletBackend.createSponsoredAccount).toHaveBeenCalledWith(testAddress)
      expect(mockedSorobanService.sendTransaction).toHaveBeenCalledWith(walletBackendResponse.transaction)
      expect(mockedUserRepository.saveUser).not.toHaveBeenCalled()
    })

    it('should throw ResourceNotFoundException when transaction status is NOT_FOUND', async () => {
      const testUser = { ...user, createdAccountAddress: undefined } as User
      mockedUserRepository.getUserByEmail.mockResolvedValue(testUser)
      mockedWalletBackend.createSponsoredAccount.mockResolvedValue(walletBackendResponse)
      mockedSorobanService.sendTransaction.mockResolvedValue({
        status: rpc.Api.GetTransactionStatus.NOT_FOUND,
        hash: 'test-transaction-hash',
      } as unknown as rpc.Api.GetSuccessfulTransactionResponse)

      await expect(useCase.handle(basePayload)).rejects.toBeInstanceOf(ResourceNotFoundException)

      expect(mockedWalletBackend.createSponsoredAccount).toHaveBeenCalledWith(testAddress)
      expect(mockedSorobanService.sendTransaction).toHaveBeenCalledWith(walletBackendResponse.transaction)
      expect(mockedUserRepository.saveUser).not.toHaveBeenCalled()
    })
  })
})
