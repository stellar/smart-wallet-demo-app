import path from 'path'

import { DataSource, DataSourceOptions } from 'typeorm'

import { SnakeNamingStrategy } from 'api/core/framework/orm/naming-strategy'
import { getValueFromEnv, isProdEnv, rootDir } from 'config/env-utils'

// Current rules applied here are focused on Heroku environment
const deploymentOptions = isProdEnv()
  ? {
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }
  : {}

export const AppDataSource = new DataSource({
  name: 'default',
  type: getValueFromEnv('DATABASE_TYPE'),
  database: getValueFromEnv('DATABASE_NAME'),
  host: getValueFromEnv('DATABASE_HOST'),
  port: Number(getValueFromEnv('DATABASE_PORT')),
  username: getValueFromEnv('DATABASE_USER'),
  password: getValueFromEnv('DATABASE_PASSWORD'),
  migrations: [path.join(rootDir, 'api/core/migrations/*.{js,ts}')],
  entities: [path.join(rootDir, 'api/core/entities/*/model.{js,ts}')],
  namingStrategy: new SnakeNamingStrategy(),
  ...deploymentOptions,
} as DataSourceOptions)
