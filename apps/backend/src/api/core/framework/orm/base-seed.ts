import { DataSource } from 'typeorm'

import { logger } from 'config/logger'

export interface SeedInterface {
  name: string
  run(dataSource: DataSource): Promise<void>
}

export abstract class BaseSeed implements SeedInterface {
  abstract name: string

  abstract run(dataSource: DataSource): Promise<void>

  protected async shouldSkip(_dataSource: DataSource, checkFn: () => Promise<boolean>): Promise<boolean> {
    try {
      return await checkFn()
    } catch (error) {
      logger.error({ err: error }, '❌ Error checking if seed should be skipped')
      // If check fails, assume we should not skip
      return false
    }
  }
}
