import * as HTTPServer from 'http'

import { isTestEnv } from 'config/env-utils'
import http from 'interfaces/express'

const server: HTTPServer.Server = HTTPServer.createServer(http)

if (!isTestEnv()) {
  server.listen(process.env.PORT)
}

//AWS LOAD BALANCE FIX
server.keepAliveTimeout = 61 * 1000
server.headersTimeout = 65 * 1000

export { http }
