import axios, { AxiosInstance } from 'axios'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import { AxiosLogger } from 'config/axios-logger'
import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'
import { AccountRequest, AccountResponse, HorizonType } from './types'

export const CONNECTION_TIMEOUT = 10000

export default class Horizon extends SingletonBase implements HorizonType {
  private horizonConnection: AxiosInstance

  constructor(connection?: AxiosInstance) {
    super()
    this.horizonConnection =
      connection ??
      axios.create({
        baseURL: getValueFromEnv('HORIZON_API_URL', 'https://horizon-testnet.stellar.org'),
        timeout: CONNECTION_TIMEOUT,
      })

    const axiosLogger = new AxiosLogger(this.constructor.name)
    this.horizonConnection.interceptors.request.use(axiosLogger.createRequestInterceptor)
    this.horizonConnection.interceptors.response.use(
      axiosLogger.createFulfilledResponseInterceptor,
      axiosLogger.createRejectedResponseInterceptor
    )
  }

  public async getAccountBalance(account: AccountRequest): Promise<AccountResponse> {
    const accountUrl = `/accounts/${account.address}`

    try {
      const response = await this.horizonConnection.get(accountUrl)

      return response.data as AccountResponse
    } catch (error) {
      logger.error(error, 'Horizon - Error getting account data')
      throw error
    }
  }
}
