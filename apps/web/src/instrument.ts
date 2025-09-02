import * as Sentry from '@sentry/react'

import logger from 'src/app/core/services/logger'

const dsn = import.meta.env.VITE_SENTRY_DSN

if (dsn) {
  try {
    const environment = import.meta.env.VITE_ENVIRONMENT_NAME || 'development'

    Sentry.init({
      dsn,
      environment,

      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers.authorization
        }

        return event
      },

      sendDefaultPii: false,
      attachStacktrace: true,
      debug: environment !== 'production',
    })

    logger.log('Sentry initialized successfully')
  } catch (sentryError) {
    logger.warn('Failed to initialize Sentry:', sentryError)
  }
} else {
  logger.log('Sentry DSN not configured, skipping initialization')
}
