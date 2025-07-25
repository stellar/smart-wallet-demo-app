import axios, { AxiosInstance } from 'axios'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { AxiosLogger } from 'config/axios-logger'
import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'

import {
  CheckWalletStatusResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  GetContractAddressResponse,
  SDPEmbeddedWalletsType,
} from './types'

export const CONNECTION_TIMEOUT = 10000

export default class SDPEmbeddedWallets extends SingletonBase implements SDPEmbeddedWalletsType {
  private sdpConnection: AxiosInstance

  constructor(connection?: AxiosInstance) {
    super()
    this.sdpConnection =
      connection ??
      axios.create({
        baseURL: getValueFromEnv(
          'SDP_EMBEDDED_WALLETS_URL',
          'https://stellar-disbursement-platform-backend-dev.stellar.org/embedded-wallets'
        ),
        timeout: CONNECTION_TIMEOUT,
        headers: {
          Authorization: getValueFromEnv('SDP_EMBEDDED_WALLETS_API_KEY'),
        },
      })

    const axiosLogger = new AxiosLogger(this.constructor.name)
    this.sdpConnection.interceptors.request.use(axiosLogger.createRequestInterceptor)
    this.sdpConnection.interceptors.response.use(
      axiosLogger.createFulfilledResponseInterceptor,
      axiosLogger.createRejectedResponseInterceptor
    )
  }

  public async createWallet(input: CreateWalletRequest): Promise<CreateWalletResponse> {
    const createWalletUrl = '/'

    try {
      const requestBody = input
      const response = await this.sdpConnection.post(createWalletUrl, requestBody)

      return response.data as CreateWalletResponse
    } catch (error) {
      logger.error(error, 'SDP - Error creating wallet')
      throw error
    }
  }

  public async checkWalletStatus(token: string): Promise<CheckWalletStatusResponse> {
    const checkWalletStatusUrl = `/status/${token}`

    try {
      const response = await this.sdpConnection.get(checkWalletStatusUrl)

      return response.data as CheckWalletStatusResponse
    } catch (error) {
      logger.error(error, 'SDP - Error checking wallet status')
      throw error
    }
  }

  public async getContractAddress(id: string): Promise<GetContractAddressResponse> {
    const getContractAddressUrl = `/${id}`

    try {
      const response = await this.sdpConnection.get(getContractAddressUrl)

      return response.data as CheckWalletStatusResponse
    } catch (error) {
      logger.error(error, 'SDP - Error getting contract address')
      throw error
    }
  }
}
