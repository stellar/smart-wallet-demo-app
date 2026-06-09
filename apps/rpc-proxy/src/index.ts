import http from 'http'
import { getConfig } from './config'
import { proxyWithFallback } from './proxy'

const config = getConfig()

const GET_HEALTH_BODY = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' })

async function checkRpcReadiness(providers: string[], timeout: number): Promise<{ ready: boolean; reachable: string | null; failures: string[] }> {
  const failures: string[] = []
  for (const provider of providers) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)
      const res = await fetch(provider, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: GET_HEALTH_BODY,
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (res.ok) return { ready: true, reachable: provider, failures }
      failures.push(`${provider}: HTTP ${res.status}`)
    } catch (err) {
      const msg = err instanceof Error && err.name === 'AbortError' ? 'timeout' : (err instanceof Error ? err.message : String(err))
      failures.push(`${provider}: ${msg}`)
    }
  }
  return { ready: false, reachable: null, failures }
}

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
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal proxy error' }))
      }
    }
  })

  server.listen(port, () => {
    console.log(`[rpc-proxy] ${mode.toUpperCase()} proxy on :${port} | network: ${config.network}`)
    console.log(`[rpc-proxy] Providers (in order): ${providers.join(' → ')}`)
  })
}

createServer(config.rpcProviders, 'rpc', config.rpcPort)
createServer(config.horizonProviders, 'horizon', config.horizonPort)
