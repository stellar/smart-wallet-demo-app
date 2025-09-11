import { NextFunction, Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { mockSDPEmbeddedWallets } from 'interfaces/sdp-embedded-wallets/mock'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

import { tokenValidation } from './token-validation'

const mockToken = 'test-token-uuid-1234'
const mockEmail = 'test@example.com'

const mockSdpService = mockSDPEmbeddedWallets()

let mockReq: Request
let mockRes: Response
let mockNext: NextFunction

describe('tokenValidation middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockReq = {
      query: {},
      headers: {},
      params: {},
    } as Request

    mockRes = {} as Response
    mockNext = vi.fn()
  })

  describe('successful validation', () => {
    beforeEach(() => {
      mockSdpService.checkWalletStatus.mockResolvedValue({
        status: WalletStatus.SUCCESS,
        receiver_contact: mockEmail,
        contact_type: 'email',
      })
    })

    it('should validate token from header', async () => {
      mockReq.headers['x-invitation-token'] = mockToken

      const middleware = tokenValidation(mockSdpService)
      await middleware(mockReq, mockRes, mockNext)

      expect(mockSdpService.checkWalletStatus).toHaveBeenCalledWith(mockToken)
      expect(mockReq.validatedInvitation).toEqual({
        token: mockToken,
        email: mockEmail,
        status: WalletStatus.SUCCESS,
      })
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('validation failures', () => {
    it('should throw UnauthorizedException when token is missing', async () => {
      const middleware = tokenValidation(mockSdpService)

      await expect(() => middleware(mockReq, mockRes, mockNext)).rejects.toThrow(UnauthorizedException)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException when SDP service fails', async () => {
      mockReq.headers['x-invitation-token'] = mockToken
      mockSdpService.checkWalletStatus.mockRejectedValue(new Error('SDP service error'))

      const middleware = tokenValidation(mockSdpService)

      await expect(() => middleware(mockReq, mockRes, mockNext)).rejects.toThrow(UnauthorizedException)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
