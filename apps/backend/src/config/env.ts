import path from 'path'

import { default as dotenv } from 'dotenv-safe'

import { envTypes } from 'config/env-utils'
import { logger } from 'config/logger'

const ENV: string = process.env.NODE_ENV || envTypes.DEV || envTypes.TEST

if (process.env.DEPLOY_STAGE === 'local') {
  dotenv.config({
    allowEmptyValues: true,
    path: path.join(__dirname, `../config/.env.${ENV}`),
    sample: path.join(__dirname, '../config/.env.example'),
  })
}

logger.info(`Loaded => DEPLOY_STAGE: ${process.env.DEPLOY_STAGE} | NODE_ENV: ${process.env.NODE_ENV}`)
