import { logger } from 'config/logger'

export abstract class Retryable {
  static async retry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 1000): Promise<T> {
    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (err) {
        lastError = err

        if (attempt < maxRetries) {
          const expBackoff = baseDelayMs * Math.pow(2, attempt)
          const jitter = Math.random() * 200
          const delay = expBackoff + jitter

          logger.warn(
            err,
            `${this.constructor.name} | Attempt ${attempt + 1} failed. Retrying in ${delay.toFixed(0)}ms...`
          )
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    if (lastError instanceof Error) {
      throw lastError
    }
    throw new Error(String(lastError))
  }
}
