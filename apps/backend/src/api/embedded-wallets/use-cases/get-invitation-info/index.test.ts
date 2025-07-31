import { AxiosError, AxiosResponse } from 'axios'
import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { userFactory } from 'api/core/entities/user/factory'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

import { GetInvitationInfo, endpoint } from './index'

const mockedUserRepository = mockUserRepository()
const mockedSDPEmbeddedWallets = mockSDPEmbeddedWallets()

const token = 'test-token'
const email = 'test@example.com'
const sdpCheckWalletStatusResponse = {
  status: WalletStatus.PENDING,
  receiver_contact: email,
  contact_type: 'EMAIL',
}
const user = userFactory({
  userId: 'uuid-test-user',
  uniqueToken: token,
  email,
})

let useCase: GetInvitationInfo

describe('GetInvitationInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetInvitationInfo(mockedUserRepository, mockedSDPEmbeddedWallets)
  })

  it('should return invitation info and create user if not exists', async () => {
    mockedSDPEmbeddedWallets.checkWalletStatus.mockResolvedValue(sdpCheckWalletStatusResponse)
    mockedUserRepository.getUserByToken.mockResolvedValue(null)
    mockedUserRepository.createUser.mockResolvedValue(user)

    const payload = { token }
    const result = await useCase.handle(payload)

    expect(result.data.status).toBe(sdpCheckWalletStatusResponse.status)
    expect(result.data.email).toBe(sdpCheckWalletStatusResponse.receiver_contact)
    expect(result.message).toBe('Retrieved invitation info successfully')
    expect(mockedUserRepository.createUser).toHaveBeenCalledWith({ uniqueToken: token, email }, true)
  })

  it('should return invitation info and not create user if exists', async () => {
    mockedSDPEmbeddedWallets.checkWalletStatus.mockResolvedValue(sdpCheckWalletStatusResponse)
    mockedUserRepository.getUserByToken.mockResolvedValue(user)

    const payload = { token }
    const result = await useCase.handle(payload)

    expect(result.data.status).toBe(sdpCheckWalletStatusResponse.status)
    expect(result.data.email).toBe(sdpCheckWalletStatusResponse.receiver_contact)
    expect(result.message).toBe('Retrieved invitation info successfully')
    expect(mockedUserRepository.createUser).not.toHaveBeenCalled()
  })

  it('should return NOT_ALLOWED status if checkWalletStatus returns 401', async () => {
    mockedSDPEmbeddedWallets.checkWalletStatus.mockRejectedValue(
      new AxiosError('Request failed with status code 401', 'UNAUTHORIZED', undefined, null, {
        status: 401,
      } as AxiosResponse)
    )

    const payload = { token }
    await expect(useCase.handle(payload)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('should throw non-Error exceptions from checkWalletStatus', async () => {
    mockedSDPEmbeddedWallets.checkWalletStatus.mockRejectedValue('string-error')

    const payload = { token }
    await expect(useCase.handle(payload)).rejects.toBe('string-error')
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = { params: { token } } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    mockedSDPEmbeddedWallets.checkWalletStatus.mockResolvedValue(sdpCheckWalletStatusResponse)
    mockedUserRepository.getUserByToken.mockResolvedValue(null)
    mockedUserRepository.createUser.mockResolvedValue(user)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        status: sdpCheckWalletStatusResponse.status,
        email: sdpCheckWalletStatusResponse.receiver_contact,
      },
      message: 'Retrieved invitation info successfully',
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/invitation-info/:token')
  })
})
