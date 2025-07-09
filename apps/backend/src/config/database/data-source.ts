import path from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'
import { getValueFromEnv, rootDir } from 'config/env-utils'
import { SnakeNamingStrategy } from 'api/core/framework/orm/naming-strategy'

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
} as DataSourceOptions)
