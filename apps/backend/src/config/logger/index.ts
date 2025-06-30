import { LOGGER_SERIALIZERS, loggerRedactPaths, REDACT_CENSOR } from 'api/core/constants/redact'
import pino, { LoggerOptions, stdTimeFunctions } from 'pino'

import { EnvConfigKey } from 'config/env-utils'

const prettyPinoConfig = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
    singleLine: true,
  },
}

function envConfig(env: EnvConfigKey): object {
  const devConfig = {
    transport: prettyPinoConfig,
  }
  const testConfig = {
    enabled: false,
  }
  const prodConfig: LoggerOptions = {
    messageKey: 'message',
    formatters: {
      level: (label, number) => ({
        type: label.toUpperCase(),
        level: number,
      }),
      bindings: bindings => ({
        pid: bindings.pid as string,
      }),
    },
    serializers: LOGGER_SERIALIZERS,
    timestamp: stdTimeFunctions.isoTime,
    redact: {
      paths: [
        ...loggerRedactPaths()['req'],
        ...loggerRedactPaths()['res'],
        ...loggerRedactPaths()['res.request'],
        ...loggerRedactPaths()['err.config'],
        ...loggerRedactPaths()['err.response'],
        ...loggerRedactPaths()['err.response.request'],
      ],
      censor: (_value, _path) => {
        return REDACT_CENSOR
      },
    },
  }

  const config = {
    development: devConfig,
    test: testConfig,
    production: prodConfig,
  }

  return config[env] || config.production
}

export const pinoLogger = pino(envConfig(process.env.NODE_ENV?.toString() as EnvConfigKey))

export enum LogTypes {
  Info = 'info',
  Error = 'error',
  Warn = 'warn',
  Debug = 'debug',
  Fatal = 'fatal',
}

export const logger = {
  info: (obj: unknown, msg?: string, ...args: unknown[]): void => pinoLogger.info(obj, msg, ...args),
  error: (obj: unknown, msg?: string, ...args: unknown[]): void => pinoLogger.error(obj, msg, ...args),
  warn: (obj: unknown, msg?: string, ...args: unknown[]): void => pinoLogger.warn(obj, msg, ...args),
  debug: (obj: unknown, msg?: string, ...args: unknown[]): void => pinoLogger.debug(obj, msg, ...args),
  fatal: (obj: unknown, msg?: string, ...args: unknown[]): void => pinoLogger.fatal(obj, msg, ...args),
}
