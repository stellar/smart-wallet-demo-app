import axios, { AxiosInstance } from 'axios'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { AxiosLogger } from 'config/axios-logger'
import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'

import { generateToken } from './auth/jwt'
import {
  AccountRequest,
  GetTransactionsResponse,
  TransactionBuildRequest,
  TransactionBuildResponse,
  TransactionRequest,
  TransactionResponse,
  WalletBackendType,
} from './types'

export const CONNECTION_TIMEOUT = 10000

// https://petstore.swagger.io/?url=https://raw.githubusercontent.com/stellar/wallet-backend/refs/heads/main/openapi/main.yaml
export default class WalletBackend extends SingletonBase implements WalletBackendType {
  private connection: AxiosInstance

  constructor(connection?: AxiosInstance) {
    super()
    this.connection =
      connection ??
      axios.create({
        baseURL: getValueFromEnv(
          'STELLAR_WALLET_BACKEND_URL',
          'https://wallet-backend-testnet-21ac687b8418.herokuapp.com'
        ),
        timeout: CONNECTION_TIMEOUT,
      })

    const axiosLogger = new AxiosLogger(this.constructor.name)
    this.connection.interceptors.request.use(axiosLogger.createRequestInterceptor)
    this.connection.interceptors.response.use(
      axiosLogger.createFulfilledResponseInterceptor,
      axiosLogger.createRejectedResponseInterceptor
    )
  }

  public async registerAccount(account: AccountRequest): Promise<object> {
    const registerUrl = `/accounts/${account.address}`

    // TODO: intercept the request, generate and inject the auth token automatically. See line 38 example above.
    const authToken = await generateToken({
      methodAndPath: `POST ${registerUrl.split('?')[0]}`.trim(),
      bodyHash: '',
    })

    try {
      const response = await this.connection.post(registerUrl, '', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  public async deregisterAccount(account: AccountRequest): Promise<object> {
    const deregisterUrl = `/accounts/${account.address}`

    const authToken = await generateToken({
      methodAndPath: `DELETE ${deregisterUrl.split('?')[0]}`.trim(),
      bodyHash: '',
    })

    try {
      const response = await this.connection.delete(deregisterUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      return response.data
    } catch (error) {
      logger.error(error, 'Wallet Backend - Error deregistering account')
      throw error
    }
  }

  /**
   * @param account
   * @returns
   */
  public async getTransactions(account: AccountRequest): Promise<GetTransactionsResponse> {
    const transactionsUrl = `/graphql/query`

    const query = `
    query GetAccount($address: String!) {
      account(address: $address) {
        address
        transactions {
          hash
          envelopeXdr
          operations {
            id
            operationXdr
          }
        }
      }
    }
    `

    const variables = {
      address: account.address,
    }

    const authToken = await generateToken({
      methodAndPath: `POST ${transactionsUrl}`,
      bodyHash: JSON.stringify({ query, variables }),
    })

    try {
      const response = await this.connection.post(
        transactionsUrl,
        {
          query,
          variables,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      return response.data as GetTransactionsResponse
    } catch (error) {
      logger.error(error, 'Wallet Backend - Error fetching transactions')
      throw error
    }
  }

  public async buildTransaction(
    account: AccountRequest,
    transactions: TransactionBuildRequest
  ): Promise<TransactionBuildResponse> {
    const buildTransactionUrl = '/transactions/build'

    const authToken = await generateToken({
      // sub: account.address,
      methodAndPath: `POST ${buildTransactionUrl}`,
      bodyHash: JSON.stringify(transactions),
    })

    try {
      const response = await this.connection.post(buildTransactionUrl, transactions, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      return response.data as TransactionBuildResponse
    } catch (error) {
      logger.error(error, 'Wallet Backend - Error building transaction')
      throw error
    }
  }

  public async createFeeBumpTransaction(
    account: AccountRequest,
    transaction: TransactionRequest
  ): Promise<TransactionResponse> {
    const feeBumpTransactionUrl = '/tx/create-fee-bump'

    const authToken = await generateToken({
      // sub: account.address,
      methodAndPath: `POST ${feeBumpTransactionUrl}`,
      bodyHash: JSON.stringify(transaction),
    })

    try {
      const response = await this.connection.post(feeBumpTransactionUrl, transaction, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      return response.data as TransactionResponse
    } catch (error) {
      logger.error(error, 'Wallet Backend - Error building transaction')
      throw error
    }
  }
}
