import 'config/env'
import * as Sentry from '@sentry/node'

import { getValueFromEnv, isProdEnv, isTestEnv, EnvironmentName, isMainnet, isLocalDeployStage } from 'config/env-utils'
import { logger } from 'config/logger'

if (!isTestEnv()) {
  const dsn = getValueFromEnv('SENTRY_DSN', '')

  if (dsn) {
    Sentry.init({
      dsn,
      environment: isLocalDeployStage() ? 'development' : isMainnet() ? EnvironmentName.PROD : EnvironmentName.STAGING,
      release: getValueFromEnv('SENTRY_RELEASE', '') || undefined,

      integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],

      beforeSend(event) {
        if (event.request?.url?.includes('/health')) {
          return null
        }

        if (event.request?.headers) {
          delete event.request.headers.authorization
        }

        return event
      },

      sendDefaultPii: false,
      attachStacktrace: true,
      debug: !isProdEnv(),
    })

    logger.info('Sentry initialized successfully')
  } else {
    logger.info('Sentry DSN not configured, skipping initialization')
  }
}
