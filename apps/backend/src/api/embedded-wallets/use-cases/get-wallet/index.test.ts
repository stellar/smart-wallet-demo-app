import { xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Asset as AssetModel } from 'api/core/entities/asset/model'
import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockAssetRepository } from 'api/core/services/asset/mock'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'
import { CheckWalletStatusResponse, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import { mockSorobanService } from 'interfaces/soroban/mock'
import { SimulationResult } from 'interfaces/soroban/types'

import { GetWallet, endpoint } from './index'

const mockedUserRepository = mockUserRepository()
const mockedSDPEmbeddedWallets = mockSDPEmbeddedWallets()
const mockedAssetRepository = mockAssetRepository()
const mockedSorobanService = mockSorobanService()

const user = userFactory({
  userId: 'user-123',
  contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
  uniqueToken: 'unique-token',
})

const mockResponse = () => {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnThis()
  res.json = vi.fn().mockReturnThis()
  res.locals = { tokenData: { userId: 'user-123' } }
  return res as Response
}

let getWallet: GetWallet

describe('GetWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getWallet = new GetWallet(
      mockedUserRepository,
      mockedSDPEmbeddedWallets,
      mockedSorobanService,
      undefined,
      mockedAssetRepository
    )
  })

  it('should throw UnauthorizedException if userId is missing', async () => {
    const req = {} as Request
    const res = mockResponse()
    res.locals.tokenData = undefined

    await expect(getWallet.executeHttp(req, res)).rejects.toThrow(UnauthorizedException)
  })

  it('should throw ResourceNotFoundException if user does not exist', async () => {
    mockedUserRepository.getUserById.mockResolvedValue(null)
    const payload = { id: 'user-123' }

    await expect(getWallet.handle(payload)).rejects.toThrow(ResourceNotFoundException)
  })

  it('should return wallet details if user already has a contractAddress', async () => {
    mockedUserRepository.getUserById.mockResolvedValue(user)
    mockedAssetRepository.getAssetByType.mockResolvedValue({
      assetId: 'asset-1',
      name: 'Stellar Lumens',
      type: 'native',
      contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      code: 'XLM',
    } as unknown as AssetModel)

    // Mock the Soroban service response
    const mockScVal = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        hi: xdr.Int64.fromString('0'),
        lo: xdr.Uint64.fromString('10000000'), // 1 XLM in stroops
      })
    )

    mockedSorobanService.simulateContract.mockResolvedValue({
      simulationResponse: {
        result: {
          retval: mockScVal,
          auth: [],
        },
      },
    } as unknown as SimulationResult)

    const payload = { id: 'user-123' }

    const result = await getWallet.handle(payload)
    expect(result.data.status).toBe(WalletStatus.SUCCESS)
    expect(result.data.address).toBe('CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE')
    expect(result.data.balance).toBe(10000000)
    expect(result.data.email).toBe(user.email)
    expect(mockedSDPEmbeddedWallets.checkWalletStatus).not.toHaveBeenCalled()
    expect(mockedUserRepository.updateUser).not.toHaveBeenCalled()
    expect(mockedSorobanService.simulateContract).toHaveBeenCalledWith({
      contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      method: 'balance',
      args: [expect.any(xdr.ScVal)],
    })
  })

  it('should check wallet status and update user if contract_address is returned', async () => {
    mockedUserRepository.getUserById.mockResolvedValue({ ...user, contractAddress: undefined } as User)
    mockedSDPEmbeddedWallets.checkWalletStatus.mockResolvedValueOnce({
      status: WalletStatus.PENDING,
      contract_address: undefined,
    } as CheckWalletStatusResponse)
    mockedSDPEmbeddedWallets.checkWalletStatus.mockResolvedValueOnce({
      status: WalletStatus.SUCCESS,
      contract_address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
    } as CheckWalletStatusResponse)
    mockedUserRepository.updateUser.mockResolvedValue({
      ...user,
      contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
    } as User)

    const payload = { id: 'user-123' }
    const result = await getWallet.handle(payload)
    expect(result.data.status).toBe(WalletStatus.SUCCESS)
    expect(result.data.address).toBe('CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE')
    expect(mockedSDPEmbeddedWallets.checkWalletStatus).toHaveBeenCalledTimes(2)
    expect(mockedUserRepository.updateUser).toHaveBeenCalledWith('user-123', {
      contractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
    })
  })

  it('should throw error if checkWalletStatus returns empty contractAddress', async () => {
    mockedUserRepository.getUserById.mockResolvedValue({ ...user, contractAddress: undefined } as User)
    mockedSDPEmbeddedWallets.checkWalletStatus.mockResolvedValue({
      status: WalletStatus.PENDING,
      contract_address: undefined,
    } as CheckWalletStatusResponse)

    const payload = { id: 'user-123' }
    await expect(getWallet.handle(payload)).rejects.toBeInstanceOf(BadRequestException)
    expect(mockedSDPEmbeddedWallets.checkWalletStatus).toHaveBeenCalledTimes(3)
  })

  it('should parse response message correctly', () => {
    expect(
      getWallet.parseResponse({
        status: WalletStatus.SUCCESS,
        address: 'wallet-address',
        balance: 123.456,
        email: 'your@email.com',
      })
    ).toEqual({
      data: {
        status: WalletStatus.SUCCESS,
        address: 'wallet-address',
        balance: 123.456,
        email: 'your@email.com',
      },
      message: 'Wallet details retrieved successfully',
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
