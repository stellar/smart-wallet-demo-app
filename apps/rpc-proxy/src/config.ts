import dotenv from 'dotenv'

dotenv.config()

export type NetworkType = 'testnet' | 'mainnet' | 'futurenet'

const VALID_NETWORKS: NetworkType[] = ['testnet', 'mainnet', 'futurenet']

function parseNetwork(value: string | undefined): NetworkType {
  const network = value ?? 'testnet'
  if (!(VALID_NETWORKS as string[]).includes(network)) {
    throw new Error(`Invalid STELLAR_NETWORK: "${network}". Must be one of: ${VALID_NETWORKS.join(', ')}`)
  }
  return network as NetworkType
}

function parseIntEnv(name: string, value: string | undefined, defaultValue: number): number {
  const raw = value ?? String(defaultValue)
  const parsed = parseInt(raw, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: "${raw}". Must be a positive integer.`)
  }
  return parsed
}

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

  return byNetwork[network]
}

function getHorizonProviders(network: NetworkType): string[] {
  const byNetwork: Record<NetworkType, string[]> = {
    testnet: envProviders('HORIZON_PROVIDER_TESTNET'),
    mainnet: envProviders('HORIZON_PROVIDER_MAINNET'),
    futurenet: envProviders('HORIZON_PROVIDER_FUTURENET'),
  }

  return byNetwork[network]
}

export function getConfig(): ProxyConfig {
  const network = parseNetwork(process.env.STELLAR_NETWORK)
  const rpcPort = parseIntEnv('RPC_PROXY_PORT', process.env.RPC_PROXY_PORT, 8301)
  const horizonPort = parseIntEnv('HORIZON_PROXY_PORT', process.env.HORIZON_PROXY_PORT, 8302)
  const timeout = parseIntEnv('PROVIDER_TIMEOUT_MS', process.env.PROVIDER_TIMEOUT_MS, 10000)
  const readinessTimeout = parseIntEnv('READINESS_TIMEOUT_MS', process.env.READINESS_TIMEOUT_MS, 3000)

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
