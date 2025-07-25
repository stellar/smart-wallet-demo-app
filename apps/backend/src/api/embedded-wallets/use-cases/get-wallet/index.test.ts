import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'
import { CheckWalletStatusResponse, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

import { GetWallet, endpoint } from './index'

const mockedUserRepository = mockUserRepository()
const mockedSDPEmbeddedWallets = mockSDPEmbeddedWallets()

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
    getWallet = new GetWallet(mockedUserRepository, mockedSDPEmbeddedWallets)
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
    const payload = { id: 'user-123' }

    const result = await getWallet.handle(payload)
    expect(result.data.status).toBe(WalletStatus.SUCCESS)
    expect(result.data.address).toBe('CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE')
    expect(mockedSDPEmbeddedWallets.checkWalletStatus).not.toHaveBeenCalled()
    expect(mockedUserRepository.updateUser).not.toHaveBeenCalled()
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

  it('should return pending status if wallet is not created after retries', async () => {
    mockedUserRepository.getUserById.mockResolvedValue({ ...user, contractAddress: undefined } as User)
    mockedSDPEmbeddedWallets.checkWalletStatus.mockResolvedValue({
      status: WalletStatus.PENDING,
      contract_address: undefined,
    } as CheckWalletStatusResponse)

    const payload = { id: 'user-123' }
    const result = await getWallet.handle(payload)
    expect(result.data.status).toBe(WalletStatus.PENDING)
    expect(result.data.address).toBeUndefined()
    expect(mockedSDPEmbeddedWallets.checkWalletStatus).toHaveBeenCalledTimes(3)
  })

  it('should parse response message correctly', () => {
    expect(getWallet.parseResponse({ status: WalletStatus.SUCCESS, address: 'wallet-address' })).toEqual({
      data: {
        status: WalletStatus.SUCCESS,
        address: 'wallet-address',
      },
      message: 'Wallet details retrieved successfully',
    })
    expect(getWallet.parseResponse({ status: WalletStatus.PENDING })).toEqual({
      data: {
        status: WalletStatus.PENDING,
      },
      message: 'Wallet details retrieved successfully',
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
