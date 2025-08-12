import { sha256Hash } from 'api/core/utils/crypto'
import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'

interface GiftEligibilityServiceConfig {
  baseUrl: string
  requestTimeout: number
}

export interface IGiftEligibilityService {
  checkGiftEligibility(giftId: string): Promise<boolean>
}

export class GiftEligibilityService implements IGiftEligibilityService {
  private readonly config: GiftEligibilityServiceConfig

  constructor(config?: Partial<GiftEligibilityServiceConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || getValueFromEnv('GIFT_STORAGE_BASE_URL'),
      requestTimeout: config?.requestTimeout || parseInt(getValueFromEnv('GIFT_ELIGIBILITY_TIMEOUT', '5000')),
    }
  }

  async checkGiftEligibility(giftId: string): Promise<boolean> {
    const giftIdHash = sha256Hash(giftId)
    logger.debug({ giftIdHash }, 'Checking gift eligibility in storage')

    try {
      const giftUrl = `${this.config.baseUrl}/${giftId}`

      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), this.config.requestTimeout)

      const response = await fetch(giftUrl, {
        method: 'HEAD',
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        logger.info({ giftIdHash }, 'Gift is eligible for claiming')
        return true
      }

      if (response.status === 404) {
        logger.debug({ giftIdHash }, 'Gift not found in storage')
        return false
      }

      logger.warn(
        { giftIdHash, status: response.status, statusText: response.statusText },
        'Unexpected response status during gift eligibility check'
      )
      return false
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn(
          { giftIdHash, timeout: this.config.requestTimeout },
          'Request timeout during gift eligibility check'
        )
      } else {
        logger.error({ giftIdHash, error }, 'Error during gift eligibility check request')
      }
      return false
    }
  }
}
