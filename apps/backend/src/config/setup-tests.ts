import path from 'path'

import { config } from 'dotenv'
config({ path: path.resolve(__dirname, './.env.test') })

process.env.DEBUG = 'false'
