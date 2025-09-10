import 'express-async-errors'
import 'reflect-metadata'

import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import * as swaggerUI from 'swagger-ui-express'

import { apiKeyAuthentication } from 'api/core/middlewares/api-key-authentication'
import { isTestEnv } from 'config/env-utils'
import { logger } from 'config/logger'
import { swaggerDefinition } from 'interfaces/express/openapi'

const application: express.Application = express()

// MIDDLEWARES
const corsOptions = {
  origin: [process.env.FRONT_ADDRESS ?? 'http://localhost:3000'],
  credentials: true,
}
application.use(cors(corsOptions))
application.use(bodyParser.urlencoded({ extended: true }))
application.use(bodyParser.json())

// DOCS
const docsUrl = '/docs'

const swaggerOptions = {
  swaggerOptions: {
    url: `${docsUrl}/swagger.json`,
  },
}

application.get(`${docsUrl}/swagger.json`, apiKeyAuthentication, (_req, res) => res.json(swaggerDefinition))
application.use(docsUrl, swaggerUI.serveFiles(undefined, swaggerOptions), swaggerUI.setup(undefined, swaggerOptions))

if (!isTestEnv()) {
  logger.info(`Loaded => express`)
}

export default application
