import { randomUUID } from 'crypto'

import { AxiosError, AxiosHeaders, AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { parseIfJson } from 'api/core/utils/parse-if-json'
import { logger } from 'config/logger'

type AdditionalAxiosRequestConfig = InternalAxiosRequestConfig & {
  requestId: string
}

export class AxiosLogger {
  instanceName: string

  constructor(instanceName: string) {
    this.instanceName = instanceName
  }

  public createRequestInterceptor: (config: InternalAxiosRequestConfig) => AdditionalAxiosRequestConfig = config => {
    const { method, url, data, headers, params } = config
    const axiosRequestId = headers['X-Request-ID'] ?? headers['Idempotency-Key'] ?? randomUUID()

    const endpoint = `${method?.toUpperCase()} ${url}`.trim()
    logger.info(
      {
        id: axiosRequestId,
        req: {
          method: method?.toUpperCase(),
          url,
          data,
          headers,
          params,
        },
      },
      `${this.instanceName} | ${endpoint} | Request Sent`
    )

    const newConfig: AdditionalAxiosRequestConfig = {
      ...config,
      requestId: axiosRequestId,
    }

    return newConfig
  }

  public createFulfilledResponseInterceptor: (response: AxiosResponse, requestId?: string) => AxiosResponse = (
    response,
    requestId
  ) => {
    const { config: _config, data, headers, status, statusText, request } = response

    let axiosRequestId = requestId // allow passing in requestId from the outside for logging purposes
    const { requestId: configRequestId, url, method } = _config as AdditionalAxiosRequestConfig

    if (!axiosRequestId) axiosRequestId = configRequestId

    const endpoint = `${method?.toUpperCase()} ${url}`.trim()
    logger.info(
      {
        id: axiosRequestId,
        res: {
          data,
          headers,
          status,
          statusText,
          request,
        },
      },
      `${this.instanceName} | ${endpoint} | Response Received`
    )

    return response
  }

  public createRejectedResponseInterceptor: (
    error: AxiosError,
    requestId?: string,
    options?: {
      rejectPromise?: boolean
    }
  ) => AxiosError | Promise<never> = (error, requestId, options) => {
    error = this.formatAxiosError(error)
    const { config: _config, response } = error

    let res
    if (response) {
      const { data, headers, status, statusText, request } = response

      res = {
        data,
        headers,
        status,
        statusText,
        request,
      }
    }

    if (_config) {
      let axiosRequestId = requestId // allow passing in requestId from the outside for logging purposes
      const { requestId: configRequestId, url, method, data, headers, params } = _config as AdditionalAxiosRequestConfig

      if (!axiosRequestId) axiosRequestId = configRequestId

      const endpoint = `${method?.toUpperCase()} ${url}`.trim()
      logger.error(
        {
          id: axiosRequestId,
          res,
          req: {
            method: method?.toUpperCase(),
            url,
            data,
            headers,
            params,
          },
        },
        `${this.instanceName} | ${endpoint} | Request Failed`
      )
    }

    const rejectPromise = options?.rejectPromise

    return typeof rejectPromise === 'boolean' && rejectPromise === false ? error : Promise.reject(error)
  }

  private formatAxiosError: (error: AxiosError) => AxiosError = error => {
    if (error.config) {
      error.config.data = parseIfJson(error.config.data)
      error.config.headers = parseIfJson(error.config.headers) as AxiosRequestHeaders
      error.config.params = parseIfJson(error.config.params)
    }

    if (error.response) {
      error.response.data = parseIfJson(error.response.data)
      error.response.headers = parseIfJson(error.response.headers) as AxiosHeaders

      if (error.response.request) {
        error.response.request.data = parseIfJson(error.response.request.data)
        error.response.request.headers = parseIfJson(error.response.request.headers)
        error.response.request.params = parseIfJson(error.response.request.params)
      }
    }

    return error
  }
}
