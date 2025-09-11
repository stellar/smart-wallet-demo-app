import './instrument'
import * as Sentry from '@sentry/node'
import express, { Router } from 'express'

import { exceptionMiddleware } from 'api/core/middlewares/exception'
import { httpLoggerMiddleware } from 'api/core/middlewares/http-logger'
import { initLogMetadata } from 'api/core/middlewares/init-log-metadata'
import { interceptResponseDataMiddleware } from 'api/core/middlewares/intercept-response-data'
import { requestIdMiddleware } from 'api/core/middlewares/request-id'
import { routes } from 'api/core/routes'
import { initializeDatabase } from 'config/database'
import { getValueFromEnv, isTestEnv } from 'config/env-utils'
import { logger } from 'config/logger'

let app: Application | null = null

class Application {
  public project: string
  public server: Router
  public http: express.Application

  constructor() {
    // SETTINGS
    this.project = 'smart-wallet-backend'
    this.config().then(async () => {
      // INTERFACES
      const { http } = await import('interfaces')
      this.http = http

      // CREATE SERVER
      this.server = Router()

      // APPLY EXPRESS
      http.use(this.server)

      this.server.use(requestIdMiddleware)
      this.server.use(interceptResponseDataMiddleware)
      this.server.use(initLogMetadata)
      this.server.use(httpLoggerMiddleware())

      // API ROUTES
      routes(this.server)

      // Sentry error handler
      Sentry.setupExpressErrorHandler(http)

      // Error handling
      http.use(exceptionMiddleware)

      if (!isTestEnv()) {
        logger.info(`Server is running 🚀 | PORT: ${getValueFromEnv('PORT')}`)
      }
    })
  }

  private async config(): Promise<void> {
    await import('interfaces/batch-mint/batch-processor')
    await initializeDatabase()
  }
}

function getServer(): Application {
  if (app !== null) return app

  app = new Application()
  return app
}

export default getServer()
