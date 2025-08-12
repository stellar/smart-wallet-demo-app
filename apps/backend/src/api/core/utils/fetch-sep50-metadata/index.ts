import axios, { AxiosInstance } from 'axios'

import { AxiosLogger } from 'config/axios-logger'

export interface Sep50Metadata {
  name?: string
  description?: string
  image?: string
  image_data?: string
  external_url?: string
  attributes?: {
    trait_type: string
    value: string | number | boolean
    display_type?: string
    max_value?: number
  }[]
  animation_url?: string
  background_color?: string
  name_prefix?: string
  name_suffix?: string
  collection?: {
    name: string
    family: string
  }
  properties?: Record<
    string,
    | string
    | number
    | boolean
    | string[]
    | number[]
    | {
        type?: string
        uri?: string
        [key: string]: unknown
      }[]
  >
}

export const fetchSep50Metadata = async (tokenUri: string): Promise<Sep50Metadata> => {
  const connection: AxiosInstance = axios.create({ timeout: 10000 })

  const axiosLogger = new AxiosLogger('fetchSep50Metadata')
  connection.interceptors.request.use(axiosLogger.createRequestInterceptor)
  connection.interceptors.response.use(
    axiosLogger.createFulfilledResponseInterceptor,
    axiosLogger.createRejectedResponseInterceptor
  )

  const response = await connection.get(tokenUri, {
    timeout: 10000, // 10 second timeout
    headers: {
      Accept: 'application/json',
      'User-Agent': 'SmartWallet/1.0',
    },
  })

  if (response.status !== 200) {
    throw new Error(`Failed to fetch metadata: HTTP ${response.status}`)
  }

  const metadata = response.data

  // Validate that it's a valid JSON object
  if (typeof metadata !== 'object' || metadata === null) {
    throw new Error('Invalid metadata format: expected JSON object')
  }

  return metadata as Sep50Metadata
}
