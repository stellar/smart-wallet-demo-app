/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/react'
import axios, { AxiosResponse, HttpStatusCode, InternalAxiosRequestConfig } from 'axios'

import { useAccessTokenStore } from 'src/app/auth/store'

export const accessTokenInterceptor = (config: InternalAxiosRequestConfig<any>) => {
  const accessToken = useAccessTokenStore.getState().accessToken

  if (!accessToken) {
    // Cancel the request if there is no access token
    // eslint-disable-next-line import/no-named-as-default-member
    const cancelSource = axios.CancelToken.source()
    config.cancelToken = cancelSource.token
    cancelSource.cancel('Request interrupted: no token')
  } else {
    config.headers.Authorization = `${accessToken}`
  }

  return config
}

export const apiKeyInterceptor = (config: InternalAxiosRequestConfig<any>) => {
  const apiKey = import.meta.env.VITE_X_API_KEY

  config.headers['x-api-key'] = `${apiKey}`

  return config
}

export const unauthorizedInterceptor = [
  (response: AxiosResponse<any, any>) => response,
  (error: any) => {
    const requestContext = {
      url: error.config?.url,
      method: error.config?.method,
      userAgent: navigator.userAgent,
    }

    if (error.response?.status !== HttpStatusCode.Unauthorized && error.response?.status >= 500) {
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setLevel('error')
        scope.setTag('errorType', 'api')
        scope.setTag('section', 'http')
        scope.setContext('request', requestContext)
        scope.setExtra('status', error.response?.status)
        scope.setExtra('statusText', error.response?.statusText)
        scope.setExtra('responseData', error.response?.data)

        Sentry.captureException(error)
      })
    }

    if (error.response?.status === HttpStatusCode.Unauthorized) {
      // Clear the access token and redirect to the login page
      useAccessTokenStore.getState().clearAccessToken()
    }

    return Promise.reject(error)
  },
]
