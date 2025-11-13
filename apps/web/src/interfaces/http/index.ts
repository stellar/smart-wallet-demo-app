import axios from 'axios'

import { accessTokenInterceptor, apiKeyInterceptor, unauthorizedInterceptor } from './interceptors'

const baseConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8201',
  withCredentials: true,
}

// Unauthenticated requests
const http = axios.create(baseConfig)

// Authenticated requests
const authHttp = axios.create(baseConfig)
authHttp.interceptors.request.use(accessTokenInterceptor)
authHttp.interceptors.response.use(...unauthorizedInterceptor)

// Unauthenticated requests
const apiKeyHttp = axios.create(baseConfig)
apiKeyHttp.interceptors.request.use(apiKeyInterceptor)

export { http, authHttp, apiKeyHttp }
