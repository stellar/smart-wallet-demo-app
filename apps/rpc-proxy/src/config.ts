import dotenv from 'dotenv'

dotenv.config()

export type NetworkType = 'testnet' | 'mainnet' | 'futurenet'

export interface ProxyConfig {
  rpcPort: number
  horizonPort: number
  network: NetworkType
  timeout: number
  readinessTimeout: number
  rpcProviders: string[]
  horizonProviders: string[]
}

function envProviders(...keys: string[]): string[] {
  return keys.map(key => process.env[key]?.trim()).filter((value): value is string => Boolean(value))
}

// Ordered by reliability preference. First provider is tried first.
function getRpcProviders(network: NetworkType): string[] {
  const byNetwork: Record<NetworkType, string[]> = {
    testnet: envProviders('SDF_TESTNET_RPC', 'GATEWAY_TESTNET_RPC', 'NODIES_TESTNET_RPC', 'LIQUIFY_TESTNET_RPC'),
    mainnet: envProviders(
      'GATEWAY_MAINNET_RPC',
      'NODIES_MAINNET_RPC',
      'SOROBANRPC_MAINNET_RPC',
      'LIGHTSAIL_MAINNET_RPC',
      'ONFINALITY_MAINNET_RPC',
      'ANKR_MAINNET_FULL_ARCHIVE_RPC',
      'LIQUIFY_MAINNET_RPC'
    ),
    futurenet: envProviders('SDF_FUTURENET_RPC', 'LIQUIFY_FUTURENET_RPC'),
  }

  return byNetwork[network] ?? byNetwork.testnet
}

function getHorizonProviders(network: NetworkType): string[] {
  const byNetwork: Record<NetworkType, string[]> = {
    testnet: envProviders('HORIZON_PROVIDER_TESTNET'),
    mainnet: envProviders('HORIZON_PROVIDER_MAINNET'),
    futurenet: envProviders('HORIZON_PROVIDER_FUTURENET'),
  }

  return byNetwork[network] ?? byNetwork.testnet
}

export function getConfig(): ProxyConfig {
  const network = (process.env.STELLAR_NETWORK ?? 'testnet') as NetworkType
  const rpcPort = parseInt(process.env.RPC_PROXY_PORT ?? '8301', 10)
  const horizonPort = parseInt(process.env.HORIZON_PROXY_PORT ?? '8302', 10)
  const timeout = parseInt(process.env.PROVIDER_TIMEOUT_MS ?? '10000', 10)
  const readinessTimeout = parseInt(process.env.READINESS_TIMEOUT_MS ?? '3000', 10)

  const customRpc = process.env.RPC_PROVIDERS?.split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const customHorizon = process.env.HORIZON_PROVIDERS?.split(',')
    .map(s => s.trim())
    .filter(Boolean)

  return {
    rpcPort,
    horizonPort,
    network,
    timeout,
    readinessTimeout,
    rpcProviders: customRpc?.length ? customRpc : getRpcProviders(network),
    horizonProviders: customHorizon?.length ? customHorizon : getHorizonProviders(network),
  }
}
