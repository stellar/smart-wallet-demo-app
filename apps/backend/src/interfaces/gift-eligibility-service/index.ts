import axios, { AxiosInstance } from 'axios'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { sha256Hash } from 'api/core/utils/crypto'
import { AxiosLogger } from 'config/axios-logger'
import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'

interface GiftEligibilityServiceConfig {
  baseUrl: string
  requestTimeout: number
}

export const CONNECTION_TIMEOUT = 5000

export interface IGiftEligibilityService {
  checkGiftEligibility(giftId: string): Promise<boolean>
}

export class GiftEligibilityService extends SingletonBase implements IGiftEligibilityService {
  private readonly config: GiftEligibilityServiceConfig
  private connection: AxiosInstance

  constructor(config?: Partial<GiftEligibilityServiceConfig>, connection?: AxiosInstance) {
    super()
    this.config = {
      baseUrl: config?.baseUrl || getValueFromEnv('GIFT_STORAGE_BASE_URL'),
      requestTimeout: config?.requestTimeout || parseInt(getValueFromEnv('GIFT_ELIGIBILITY_TIMEOUT', '5000')),
    }

    this.connection =
      connection ??
      axios.create({
        baseURL: this.config.baseUrl,
        timeout: this.config.requestTimeout,
      })

    const axiosLogger = new AxiosLogger(this.constructor.name)
    this.connection.interceptors.request.use(axiosLogger.createRequestInterceptor)
    this.connection.interceptors.response.use(
      axiosLogger.createFulfilledResponseInterceptor,
      axiosLogger.createRejectedResponseInterceptor
    )
  }

  async checkGiftEligibility(giftId: string): Promise<boolean> {
    const giftIdHash = sha256Hash(giftId)
    logger.debug({ giftIdHash }, 'Checking gift eligibility in storage')

    try {
      const response = await this.connection.head(`/${giftId}`)

      if (response.status === 200) {
        logger.info({ giftIdHash }, 'Gift is eligible for claiming')
        return true
      }

      logger.warn(
        { giftIdHash, status: response.status, statusText: response.statusText },
        'Unexpected response status during gift eligibility check'
      )
      return false
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          logger.debug({ giftIdHash }, 'Gift not found in storage')
        }

        if (error.code === 'ECONNABORTED') {
          logger.warn(
            { giftIdHash, timeout: this.config.requestTimeout },
            'Request timeout during gift eligibility check'
          )
        }

        logger.error(
          { giftIdHash, status: error.response?.status, message: error.message },
          'HTTP error during gift eligibility check'
        )
      }

      logger.error({ giftIdHash, error }, 'Unexpected error during gift eligibility check')
      return false
    }
  }
}
