import http from 'http'

import { getConfig } from './config'
import { logger } from './logger'
import { checkRpcReadiness, proxyWithFallback } from './proxy'

const config = getConfig()

function createServer(providers: string[], mode: 'rpc' | 'horizon', port: number): void {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', mode, network: config.network, providers }))
      return
    }

    if (req.url === '/health/ready') {
      if (mode === 'rpc') {
        const result = await checkRpcReadiness(providers, config.readinessTimeout)
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
      await proxyWithFallback(providers, req, res, { timeout: config.timeout, mode })
    } catch (_err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal proxy error' }))
      }
    }
  })

  server.listen(port, () => {
    logger.info(`${mode.toUpperCase()} proxy on :${port} | network: ${config.network}`)
    logger.info(`Providers (in order): ${providers.join(' → ')}`)
  })
}

createServer(config.rpcProviders, 'rpc', config.rpcPort)
createServer(config.horizonProviders, 'horizon', config.horizonPort)
