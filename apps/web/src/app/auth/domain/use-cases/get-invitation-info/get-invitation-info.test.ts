import { renderHook } from '@testing-library/react'

import { mockAuthService } from 'src/app/auth/services/auth/mocks'
import { GetInvitationInfoInput, GetInvitationInfoResult } from 'src/app/auth/services/auth/types'
import { useEmailStore } from 'src/app/auth/store'

import { GetInvitationInfoUseCase } from './index'

const mockInvitationInfoResult = {
  data: { email: 'test@example.com', status: 'SUCCESS', success: true },
  message: 'Invitation info retrieved successfully',
} satisfies GetInvitationInfoResult

const mockedAuthService = mockAuthService()

describe('GetInvitationInfoUseCase', () => {
  let useCase: GetInvitationInfoUseCase

  beforeEach(() => {
    useCase = new GetInvitationInfoUseCase(mockedAuthService)
  })

  it('should call authService.getInvitationInfo with correct input', async () => {
    const input: GetInvitationInfoInput = { uniqueToken: 'test-token' }
    mockedAuthService.getInvitationInfo.mockResolvedValue(mockInvitationInfoResult)

    await useCase.handle(input)

    expect(mockedAuthService.getInvitationInfo).toHaveBeenCalledTimes(1)
    expect(mockedAuthService.getInvitationInfo).toHaveBeenCalledWith({ uniqueToken: 'test-token' })
  })

  it('should return invitation info from authService.getInvitationInfo', async () => {
    const input: GetInvitationInfoInput = { uniqueToken: 'test-token' }
    mockedAuthService.getInvitationInfo.mockResolvedValue(mockInvitationInfoResult)

    const result = await useCase.handle(input)

    expect(result).toEqual({ email: mockInvitationInfoResult.data.email, status: mockInvitationInfoResult.data.status })
  })

  it('should update email store with invitation info email', async () => {
    const input: GetInvitationInfoInput = { uniqueToken: 'test-token' }

    const store = renderHook(() => useEmailStore()).result.current
    mockedAuthService.getInvitationInfo.mockResolvedValue(mockInvitationInfoResult)

    await useCase.handle(input)

    expect(store.email).toBe(mockInvitationInfoResult.data.email)
    store.clearEmail()
  })

  it('should not update email store if invitation info does not contain email', async () => {
    const input: GetInvitationInfoInput = { uniqueToken: 'test-token' }

    const store = renderHook(() => useEmailStore()).result.current
    mockedAuthService.getInvitationInfo.mockResolvedValue({
      ...mockInvitationInfoResult,
      data: { ...mockInvitationInfoResult.data, email: undefined },
    })

    await useCase.handle(input)

    expect(store.email).toBe(null)
    store.clearEmail()
  })

  it('should throw error if getInvitationInfo fails', async () => {
    const input: GetInvitationInfoInput = { uniqueToken: 'test-token' }
    const error = new Error('Test error')

    mockedAuthService.getInvitationInfo.mockRejectedValue(error)

    await expect(useCase.handle(input)).rejects.toThrow(error)
  })
})
