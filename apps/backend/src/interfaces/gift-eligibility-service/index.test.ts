import { vi, describe, it, expect, beforeEach } from 'vitest'

import { GiftEligibilityService } from './index'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('GiftEligibilityService', () => {
  let service: GiftEligibilityService
  const testGiftId = 'df71d865-4afa-4c0f-ac58-57d5d14adfa5'
  const testBaseUrl = 'https://your-bucket-name.your-account-id.r2.cloudflarestorage.com/'

  beforeEach(() => {
    vi.clearAllMocks()
    service = new GiftEligibilityService({
      baseUrl: testBaseUrl,
      requestTimeout: 5000,
    })
  })

  describe('checkGiftEligibility', () => {
    it('should return true when gift is eligible', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        `${testBaseUrl}/${testGiftId}`,
        expect.objectContaining({
          method: 'HEAD',
          signal: expect.any(AbortSignal),
        })
      )
    })

    it('should return false when gift is not eligible (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle timeout errors', async () => {
      const abortError = new Error('Request timeout')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValueOnce(abortError)

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle non-404 HTTP errors as false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})
