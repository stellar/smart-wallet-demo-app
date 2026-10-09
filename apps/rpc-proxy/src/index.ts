import { getConfig } from './config'
import { createServer } from './server'

const config = getConfig()

const serverOptions = {
  network: config.network,
  timeout: config.timeout,
  readinessTimeout: config.readinessTimeout,
}

createServer(config.rpcProviders, 'rpc', config.rpcPort, serverOptions)
createServer(config.horizonProviders, 'horizon', config.horizonPort, serverOptions)
