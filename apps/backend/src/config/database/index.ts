import { isTestEnv } from 'config/env-utils'
import { LogTypes, logger } from 'config/logger'

import { AppDataSource as MainDataSource } from './data-source'
import { TestDataSource } from './test-data-source'

const AppDataSource = isTestEnv() ? TestDataSource : MainDataSource

const databaseConnectionLog = (logType: LogTypes, message: string, err?: unknown) => {
  if (!isTestEnv()) {
    const mergingObject = { message, err }
    logger[logType](mergingObject, message)
  }
}

const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize()
    databaseConnectionLog(LogTypes.Info, 'Initialized database')
    await runMigrations()
  } catch (err) {
    databaseConnectionLog(LogTypes.Error, 'Error initializing database', err)
  }
}

const runMigrations = async (): Promise<void> => {
  try {
    const migrations = await AppDataSource.runMigrations()
    if (migrations.length > 0) {
      databaseConnectionLog(LogTypes.Info, `Successfully ran ${migrations.length} migrations`)
    } else {
      databaseConnectionLog(LogTypes.Info, 'No pending migrations to run')
    }
  } catch (err) {
    databaseConnectionLog(LogTypes.Error, 'Error running migrations', err)
  }
}

export { AppDataSource, initializeDatabase, runMigrations }
