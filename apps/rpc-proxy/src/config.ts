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

// Ordered by reliability preference. First provider is tried first.
const RPC_PROVIDERS: Record<NetworkType, string[]> = {
  testnet: [
    'https://soroban-testnet.stellar.org',
    'https://soroban-rpc.testnet.stellar.gateway.fm',
    'https://stellar-soroban-testnet-public.nodies.app',
    'https://stellar.liquify.com/api=41EEWAH79Y5OCGI7/testnet',
  ],
  mainnet: [
    'https://soroban-rpc.mainnet.stellar.gateway.fm',
    'https://stellar-soroban-public.nodies.app',
    'https://mainnet.sorobanrpc.com',
    'https://rpc.lightsail.network',
    'https://stellar.api.onfinality.io/public',
    'https://rpc.ankr.com/stellar_soroban',
    'https://stellar-mainnet.liquify.com/api=41EEWAH79Y5OCGI7/mainnet',
  ],
  futurenet: [
    'https://rpc-futurenet.stellar.org',
    'https://stellar.liquify.com/api=41EEWAH79Y5OCGI7/futurenet',
  ],
}

const HORIZON_PROVIDERS: Record<NetworkType, string[]> = {
  testnet: ['https://horizon-testnet.stellar.org'],
  mainnet: ['https://horizon.stellar.org'],
  futurenet: ['https://horizon-futurenet.stellar.org'],
}

export function getConfig(): ProxyConfig {
  const network = (process.env.STELLAR_NETWORK ?? 'testnet') as NetworkType
  const rpcPort = parseInt(process.env.RPC_PROXY_PORT ?? '8301', 10)
  const horizonPort = parseInt(process.env.HORIZON_PROXY_PORT ?? '8302', 10)
  const timeout = parseInt(process.env.PROVIDER_TIMEOUT_MS ?? '10000', 10)
  const readinessTimeout = parseInt(process.env.READINESS_TIMEOUT_MS ?? '3000', 10)

  const customRpc = process.env.RPC_PROVIDERS?.split(',').map(s => s.trim()).filter(Boolean)
  const customHorizon = process.env.HORIZON_PROVIDERS?.split(',').map(s => s.trim()).filter(Boolean)

  return {
    rpcPort,
    horizonPort,
    network,
    timeout,
    readinessTimeout,
    rpcProviders: customRpc?.length ? customRpc : (RPC_PROVIDERS[network] ?? RPC_PROVIDERS.testnet),
    horizonProviders: customHorizon?.length ? customHorizon : (HORIZON_PROVIDERS[network] ?? HORIZON_PROVIDERS.testnet),
  }
}
