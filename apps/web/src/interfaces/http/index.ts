import axios, { HttpStatusCode } from 'axios'

import { useAccessTokenStore } from 'src/app/auth/store'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
})

http.interceptors.request.use(config => {
  const accessToken = useAccessTokenStore.getState().accessToken

  if (accessToken) {
    config.headers.Authorization = `${accessToken}`
  }

  return Promise.resolve(config)
})

http.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === HttpStatusCode.Unauthorized) {
      useAccessTokenStore.getState().clearAccessToken()
    }

    return Promise.reject(error)
  }
)

export { http }
