import Docs from 'api/core/docs'
import { EnvironmentName, getValueFromEnv } from 'config/env-utils'

const servers: {
  url: string
  description: string
  variables?: { port?: { default: string } }
}[] = []

const deployStage = getValueFromEnv('DEPLOY_STAGE')
const environmentName = deployStage === 'local' ? null : (getValueFromEnv(`ENVIRONMENT_NAME`) as EnvironmentName)

switch (environmentName) {
  case EnvironmentName.STAGING:
    servers.push({
      url: getValueFromEnv('STAGING_SERVER_URL'),
      description: 'Staging server',
    })
    break
  case EnvironmentName.PROD:
    servers.push({
      url: getValueFromEnv('PROD_SERVER_URL'),
      description: 'Production server',
    })
    break
  default:
    servers.push({
      url: 'http://localhost:{port}',
      description: 'Local server',
      variables: {
        port: {
          default: getValueFromEnv('PORT'),
        },
      },
    })
    break
}

export const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    version: '1.0.0',
    title: 'Smart Wallet Backend API',
    description: 'Smart Wallet Backend API',
    contact: {
      name: 'Stellar Development Foundation',
      url: 'https://www.stellar.org',
    },
    // TODO: update license information
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  servers,
  components: {
    securitySchemes: {
      BearerToken: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: Docs,
}
