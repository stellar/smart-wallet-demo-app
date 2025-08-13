import axios, { AxiosError, AxiosResponse } from 'axios'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { GiftEligibilityService } from './index'

describe('GiftEligibilityService', () => {
  let service: GiftEligibilityService
  const testGiftId = 'df71d865-4afa-4c0f-ac58-57d5d14adfa5'
  const testBaseUrl = 'https://your-bucket-name.your-account-id.r2.cloudflarestorage.com/'

  const connection = axios.create({
    baseURL: testBaseUrl,
    timeout: 5000,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    service = new GiftEligibilityService(
      {
        baseUrl: testBaseUrl,
        requestTimeout: 5000,
      },
      connection
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('checkGiftEligibility', () => {
    it('should return true when gift is eligible', async () => {
      vi.spyOn(connection, 'head').mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
      })

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(true)
      expect(connection.head).toHaveBeenCalledTimes(1)
      expect(connection.head).toHaveBeenCalledWith(`/${testGiftId}`)
    })

    it('should return false when gift is not eligible (404)', async () => {
      const error = new AxiosError('Request failed with status code 404', 'ERR_BAD_REQUEST', undefined, null, {
        status: 404,
        statusText: 'Not Found',
        data: {},
      } as AxiosResponse)
      vi.spyOn(connection, 'head').mockRejectedValueOnce(error)

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(connection.head).toHaveBeenCalledTimes(1)
    })

    it('should handle network errors gracefully', async () => {
      vi.spyOn(connection, 'head').mockRejectedValueOnce(new Error('Network error'))

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(connection.head).toHaveBeenCalledTimes(1)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new AxiosError('timeout of 5000ms exceeded', 'ECONNABORTED')
      vi.spyOn(connection, 'head').mockRejectedValueOnce(timeoutError)

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(connection.head).toHaveBeenCalledTimes(1)
    })

    it('should handle non-404 HTTP errors as false', async () => {
      const error = new AxiosError(
        'Request failed with status code 500',
        'ERR_INTERNAL_SERVER_ERROR',
        undefined,
        null,
        {
          status: 500,
          statusText: 'Internal Server Error',
          data: {},
        } as AxiosResponse
      )
      vi.spyOn(connection, 'head').mockRejectedValueOnce(error)

      const result = await service.checkGiftEligibility(testGiftId)

      expect(result).toBe(false)
      expect(connection.head).toHaveBeenCalledTimes(1)
    })
  })
})
