import axios, { AxiosInstance } from 'axios'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { AxiosLogger } from 'config/axios-logger'
import { getValueFromEnv } from 'config/env-utils'

import {
  CheckWalletStatusResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  GetContractAddressResponse,
  ResendInviteResponse,
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

    const requestBody = input
    const response = await this.sdpConnection.post(createWalletUrl, requestBody)

    return response.data as CreateWalletResponse
  }

  public async checkWalletStatus(token: string): Promise<CheckWalletStatusResponse> {
    const checkWalletStatusUrl = `/status/${token}`

    const response = await this.sdpConnection.get(checkWalletStatusUrl)

    return response.data as CheckWalletStatusResponse
  }

  public async getContractAddress(id: string): Promise<GetContractAddressResponse> {
    const getContractAddressUrl = `/${id}`

    const response = await this.sdpConnection.get(getContractAddressUrl)

    return response.data as CheckWalletStatusResponse
  }

  public async resendInvite(email: string): Promise<ResendInviteResponse> {
    const resendInviteUrl = '/resend-invite'

    const requestBody = {
      contact_type: 'EMAIL',
      receiver_contact: email,
    }
    const response = await this.sdpConnection.post(resendInviteUrl, requestBody)

    return response.data as ResendInviteResponse
  }
}
