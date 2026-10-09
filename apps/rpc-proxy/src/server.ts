import http from 'http'

import { logger } from './logger'
import { checkRpcReadiness, PayloadTooLargeError, proxyWithFallback, redactProvider } from './proxy'

export interface ServerOptions {
  network: string
  timeout: number
  readinessTimeout: number
}

export function createServer(
  providers: string[],
  mode: 'rpc' | 'horizon',
  port: number,
  options: ServerOptions
): http.Server {
  const server = http.createServer(async (req, res) => {
    const requestedCorsHeaders = req.headers['access-control-request-headers']

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', requestedCorsHeaders ?? 'content-type, authorization')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({ status: 'ok', mode, network: options.network, providers: providers.map(redactProvider) })
      )
      return
    }

    if (req.url === '/health/ready') {
      if (mode === 'rpc') {
        const result = await checkRpcReadiness(providers, options.readinessTimeout)
        const status = result.ready ? 200 : 503
        res.writeHead(status, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ready: result.ready, reachable: result.reachable, failures: result.failures }))
      } else {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ready: true, mode }))
      }
      return
    }

    try {
      await proxyWithFallback(providers, req, res, { timeout: options.timeout, mode })
    } catch (err) {
      if (!res.headersSent) {
        if (err instanceof PayloadTooLargeError) {
          res.writeHead(413, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: 'Payload too large' }))
        } else {
          res.writeHead(500, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: 'Internal proxy error' }))
        }
      }
    }
  })

  server.listen(port, () => {
    logger.info(`${mode.toUpperCase()} proxy on :${port} | network: ${options.network}`)
    logger.info(`Providers (in order): ${providers.map(redactProvider).join(' → ')}`)
  })

  return server
}
