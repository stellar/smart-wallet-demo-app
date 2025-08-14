/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const unauthorizedInterceptor = [
  (response: AxiosResponse<any, any>) => response,
  (error: any) => {
    if (error.response?.status === HttpStatusCode.Unauthorized) {
      // Clear the access token and redirect to the login page
      useAccessTokenStore.getState().clearAccessToken()
    }

    return Promise.reject(error)
  },
]
