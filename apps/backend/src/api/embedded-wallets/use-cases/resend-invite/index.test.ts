import { AxiosError, AxiosResponse } from 'axios'
import { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { userFactory } from 'api/core/entities/user/factory'
import { User } from 'api/core/entities/user/types'
import { mockUserRepository } from 'api/core/services/user/mocks'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'

import { ResendInvite, endpoint } from './index'

const mockedUserRepository = mockUserRepository()
const mockedSDPEmbeddedWallets = mockSDPEmbeddedWallets()

const email = 'test@example.com'
const sdpResendInviteResponse = {
  message: 'Resend invite successfully',
}
const user = {
  ...userFactory({
    userId: 'uuid-test-user',
    email,
  }),
  contractAddress: undefined,
} as User

let useCase: ResendInvite

describe('ResendInvite', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useCase = new ResendInvite(mockedUserRepository, mockedSDPEmbeddedWallets)
  })

  it('should sent invite email successfully', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue(user)
    mockedSDPEmbeddedWallets.resendInvite.mockResolvedValue(sdpResendInviteResponse)

    const payload = { email }
    const result = await useCase.handle(payload)

    expect(result.data.email_sent).toBe(true)
    expect(result.message).toBe('Invite resent successfully')
  })

  it('should throw resource conflicted if user already has a wallet', async () => {
    mockedUserRepository.getUserByEmail.mockResolvedValue({
      ...user,
      contractAddress: 'CBYBPCQDYO2CGHZ5TCRP3TCGAFKJ6RKA2E33A5JPHTCLKEXZMQUODMNV',
    } as User)

    const payload = { email }
    const result = await useCase.handle(payload)

    expect(result.data.email_sent).toBe(true)
    expect(result.message).toBe('Invite resent successfully')
    expect(mockedSDPEmbeddedWallets.resendInvite).not.toHaveBeenCalled()
  })

  it('should throw resource conflicted if resendInvite returns 400', async () => {
    mockedSDPEmbeddedWallets.resendInvite.mockRejectedValue(
      new AxiosError('Request failed with status code 400', 'BAD_REQUEST', undefined, null, {
        status: 400,
      } as AxiosResponse)
    )

    const payload = { email }
    const result = await useCase.handle(payload)

    expect(result.data.email_sent).toBe(true)
    expect(result.message).toBe('Invite resent successfully')
  })

  it('should throw exceptions from resendInvite', async () => {
    const error = new AxiosError('Request failed with status code 500', '500')
    mockedSDPEmbeddedWallets.resendInvite.mockRejectedValue(error)

    const payload = { email }
    await expect(useCase.handle(payload)).rejects.toBe(error)
  })

  it('should call response with correct status and json in executeHttp', async () => {
    const req = { body: { email } } as unknown as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    mockedSDPEmbeddedWallets.resendInvite.mockResolvedValue(sdpResendInviteResponse)
    mockedUserRepository.getUserByEmail.mockResolvedValue(user)

    await useCase.executeHttp(req, res)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        email_sent: true,
      },
      message: 'Invite resent successfully',
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/resend-invite')
  })
})
