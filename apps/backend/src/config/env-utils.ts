import { logger } from './logger'

export type EnvConfigKey = 'development' | 'test' | 'production'

export const envTypes: Record<string, EnvConfigKey> = {
  DEV: 'development',
  TEST: 'test',
  PROD: 'production',
}

export enum EnvironmentName {
  STAGING = 'staging',
  PROD = 'production',
}

export function isDevEnv(): boolean {
  return getValueFromEnv(`NODE_ENV`) === envTypes.DEV
}

export function isTestEnv(): boolean {
  return getValueFromEnv(`NODE_ENV`) === envTypes.TEST
}

export function isProdEnv(): boolean {
  return getValueFromEnv(`NODE_ENV`) === envTypes.PROD
}

export function isMainnet(): boolean {
  return getValueFromEnv(`ENVIRONMENT_NAME`) === EnvironmentName.PROD
}

export function isLocalDeployStage(): boolean {
  return getValueFromEnv('DEPLOY_STAGE') === 'local'
}

export function getValueFromEnv(name: string, fallback?: string): string {
  const envValue = process.env[name]
  if (!envValue && typeof fallback === 'undefined') {
    logger.error(
      {
        name,
        err: `Environment variable not found`,
      },
      `Invalid configuration`
    )
    throw new Error(`Missing environment variable: ${name}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return envValue || fallback!
}

export const rootDir = getValueFromEnv(`DEPLOY_STAGE`) === 'local' ? 'src/' : 'dist/'

export const codeExtension = getValueFromEnv(`DEPLOY_STAGE`) === 'local' ? '.ts' : '.js'
