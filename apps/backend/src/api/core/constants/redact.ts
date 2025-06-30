import pino from 'pino'

import { redactUrlParams } from '../utils/redact-url-params'
import { redactUrlQueryParams } from '../utils/redact-url-query-params'

export const REDACT_CENSOR = '******'

export const REDACT_BANNED_HEADERS: string[] = []

export const REDACT_BANNED_FIELDS: string[] = []

export const REDACT_BANNED_QUERY_PARAMS: string[] = []

export const REDACT_BANNED_METADATA: string[] = []

export const LOGGER_SERIALIZERS: Record<string, pino.SerializerFn> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: (req: any): any => {
    if (req.url) req.url = redactUrlQueryParams(redactUrlParams(req.url))

    return req
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: (res: any): any => {
    if (res.url) res.url = redactUrlQueryParams(redactUrlParams(res.url))
    if (res.request?.url) res.request.url = redactUrlQueryParams(redactUrlParams(res.request.url))

    return res
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: (err: any): any => {
    if (err.config?.url) err.config.url = redactUrlQueryParams(redactUrlParams(err.config.url))
    if (err.response?.url) err.response.url = redactUrlQueryParams(redactUrlParams(err.response.url))
    if (err.response?.request?.url)
      err.response.request.url = redactUrlQueryParams(redactUrlParams(err.response.request.url))

    return err
  },
}

export const loggerRedactPaths = (
  redactBannedHeaders = REDACT_BANNED_HEADERS,
  redactBannedQueryParams = REDACT_BANNED_QUERY_PARAMS,
  redactBannedFields = REDACT_BANNED_FIELDS
): Record<string, string[]> => ({
  ['req']: [
    ...redactBannedHeaders.map(param => `req.headers${param.startsWith('[') ? param : '.' + param}`),
    ...redactBannedQueryParams.map(param => `req.params.${param}`),
    ...redactBannedQueryParams.map(param => `req.params[*].${param}`),
    ...redactBannedFields.map(param => `req.data.${param}`),
    ...redactBannedFields.map(param => `req.data[*].${param}`),
  ],
  ['res']: [
    ...redactBannedHeaders.map(param => `res.headers${param.startsWith('[') ? param : '.' + param}`),
    ...redactBannedQueryParams.map(param => `res.params.${param}`),
    ...redactBannedQueryParams.map(param => `res.params[*].${param}`),
    ...redactBannedFields.map(param => `res.data.${param}`),
    ...redactBannedFields.map(param => `res.data[*].${param}`),
  ],
  ['res.request']: [
    ...redactBannedHeaders.map(param => `res.request.headers${param.startsWith('[') ? param : '.' + param}`),
    ...redactBannedQueryParams.map(param => `res.request.params.${param}`),
    ...redactBannedQueryParams.map(param => `res.request.params[*].${param}`),
    ...redactBannedFields.map(param => `res.request.data.${param}`),
    ...redactBannedFields.map(param => `res.request.data[*].${param}`),
  ],
  ['err.config']: [
    ...redactBannedHeaders.map(param => `err.config.headers${param.startsWith('[') ? param : '.' + param}`),
    ...redactBannedQueryParams.map(param => `err.config.params.${param}`),
    ...redactBannedQueryParams.map(param => `err.config.params[*].${param}`),
    ...redactBannedFields.map(param => `err.config.data.${param}`),
    ...redactBannedFields.map(param => `err.config.data[*].${param}`),
  ],
  ['err.response']: [
    ...redactBannedHeaders.map(param => `err.response.headers${param.startsWith('[') ? param : '.' + param}`),
    ...redactBannedQueryParams.map(param => `err.response.params.${param}`),
    ...redactBannedQueryParams.map(param => `err.response.params[*].${param}`),
    ...redactBannedFields.map(param => `err.response.data.${param}`),
    ...redactBannedFields.map(param => `err.response.data[*].${param}`),
  ],
  ['err.response.request']: [
    ...redactBannedHeaders.map(param => `err.response.request.headers${param.startsWith('[') ? param : '.' + param}`),
    ...redactBannedQueryParams.map(param => `err.response.request.params.${param}`),
    ...redactBannedQueryParams.map(param => `err.response.request.params[*].${param}`),
    ...redactBannedFields.map(param => `err.response.request.data.${param}`),
    ...redactBannedFields.map(param => `err.response.request.data[*].${param}`),
  ],
})
