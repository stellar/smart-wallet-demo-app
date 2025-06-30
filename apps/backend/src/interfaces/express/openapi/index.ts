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
  case EnvironmentName.DEV:
    servers.push({
      url: 'https://dev/',
      description: 'Dev server',
    })
    break
  case EnvironmentName.QA:
    servers.push({
      url: 'https://qa/',
      description: 'QA server',
    })
    break
  case EnvironmentName.STAGING:
    servers.push({
      url: 'https://staging/',
      description: 'Staging server',
    })
    break
  case EnvironmentName.PROD:
    servers.push({
      url: 'https://production/',
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
    title: 'Node-API',
    description: 'Node API',
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  servers,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: Docs,
}
