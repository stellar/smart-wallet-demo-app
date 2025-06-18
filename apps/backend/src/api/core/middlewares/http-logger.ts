import { randomUUID } from 'crypto'

import {
  REDACT_BANNED_HEADERS,
  REDACT_BANNED_METADATA,
  REDACT_BANNED_QUERY_PARAMS,
  REDACT_CENSOR,
} from 'api/core/constants/redact'
import { redactUrlParams } from 'api/core/utils/redact-url-params'
import { redactUrlQueryParams } from 'api/core/utils/redact-url-query-params'
import { Request, Response } from 'express'
import pinoHttpLogger, { HttpLogger } from 'pino-http'

import { pinoLogger } from 'config/logger'

export function httpLoggerMiddleware(): HttpLogger {
  // pinoLogger instance does not match logger type but works
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return pinoHttpLogger({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger: pinoLogger,
    genReqId: (req: Request) => {
      return req.requestId || randomUUID()
    },
    serializers: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req: (req): any => {
        req.url = redactUrlQueryParams(redactUrlParams(req.url))
        return req
      },
    },
    customLogLevel: function (_req, res, err) {
      if (res.statusCode >= 400 || err) {
        return 'error'
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'silent'
      }
      return 'info'
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customSuccessObject: (_req, res, object): any => {
      return { ...object, ...customProps(res as Response) }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customErrorObject: (req, res, object): any => {
      return { ...object, ...customProps(res as Response) }
    },
    customSuccessMessage: (req, res) => {
      return `${req.path} | ${getInternalMessage(res as Response) || `${req.method} completed successfully`}`
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customErrorMessage: function (req, res, err): any {
      return `${req.path} | ${getInternalMessage(res as Response) || err.message || `request failed with status ${req.statusCode}`}`
    },
    redact: {
      paths: [
        ...REDACT_BANNED_HEADERS.map(param => `req.headers${param.startsWith('[') ? param : '.' + param}`),
        ...REDACT_BANNED_QUERY_PARAMS.map(param => `req.query.${param}`),
        ...REDACT_BANNED_METADATA.map(param => `metadata${param}`),
      ],
      censor: (_value, _path) => {
        // censor can be customized based on object path
        return REDACT_CENSOR
      },
    },
  })
}

function customProps(res: Response): Record<string, unknown> {
  const customProps: Record<string, unknown> = {}
  const errorCode = res?.locals?.responseRawData?.details?.code as string
  const metadata =
    res?.locals?.logMetadata && res.locals.logMetadata.size > 0
      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore spread into Object.assign works but TS is not happy
        Object.assign(...Array.from(res.locals.logMetadata))
      : {}

  if (errorCode) customProps.errorCode = errorCode
  if (metadata) customProps.metadata = metadata

  return customProps
}

function getInternalMessage(res: Response): string | undefined {
  const message =
    (res?.locals?.responseRawData?.details?.message as string) ?? (res?.locals?.responseRawData?.message as string)

  return message
}
