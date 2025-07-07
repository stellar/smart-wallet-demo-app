import path from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'
import { getValueFromEnv } from 'config/env-utils'
import { SnakeNamingStrategy } from 'api/core/framework/orm/naming-strategy'

const rootDir = `${__dirname}/../..`

// Be careful to not use this in production with a real database
export const TestDataSource = new DataSource({
  name: 'test',
  type: getValueFromEnv('DATABASE_TYPE'),
  database: getValueFromEnv('DATABASE_NAME'),
  host: getValueFromEnv('DATABASE_HOST'),
  port: Number(getValueFromEnv('DATABASE_PORT')),
  username: getValueFromEnv('DATABASE_USER'),
  password: getValueFromEnv('DATABASE_PASSWORD'),
  dropSchema: true,
  migrationsRun: true,
  synchronize: true,
  migrations: [path.join(rootDir, 'api/core/migrations/*.{js,ts}')],
  entities: [path.join(rootDir, 'api/core/entities/*/model.{js,ts}')],
  namingStrategy: new SnakeNamingStrategy(),
} as DataSourceOptions)
