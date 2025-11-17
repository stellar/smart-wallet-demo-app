import * as HTTPServer from 'http'

import { isTestEnv } from 'config/env-utils'
import http from 'interfaces/express'

const server: HTTPServer.Server = HTTPServer.createServer(http)

if (!isTestEnv()) {
  server.listen(process.env.PORT)
}

export { http }
