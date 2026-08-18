import { getConfig } from './config'

// All provider env vars the module reads, across every network — stubbed to '' (unset,
// after envProviders' trim+Boolean filter) so each test starts from a known-empty slate
// regardless of what a real local .env file might define.
const ALL_PROVIDER_KEYS = [
  'RPC_PROVIDERS',
  'HORIZON_PROVIDERS',
  'SDF_TESTNET_RPC',
  'GATEWAY_TESTNET_RPC',
  'NODIES_TESTNET_RPC',
  'LIQUIFY_TESTNET_RPC',
  'HORIZON_PROVIDER_TESTNET',
  'GATEWAY_MAINNET_RPC',
  'NODIES_MAINNET_RPC',
  'SOROBANRPC_MAINNET_RPC',
  'LIGHTSAIL_MAINNET_RPC',
  'ONFINALITY_MAINNET_RPC',
  'ANKR_MAINNET_FULL_ARCHIVE_RPC',
  'LIQUIFY_MAINNET_RPC',
  'HORIZON_PROVIDER_MAINNET',
  'SDF_FUTURENET_RPC',
  'LIQUIFY_FUTURENET_RPC',
  'HORIZON_PROVIDER_FUTURENET',
]

describe('getConfig', () => {
  beforeEach(() => {
    for (const key of ALL_PROVIDER_KEYS) vi.stubEnv(key, '')
    vi.stubEnv('STELLAR_NETWORK', 'testnet')
    vi.stubEnv('SDF_TESTNET_RPC', 'https://soroban-testnet.stellar.org')
    vi.stubEnv('HORIZON_PROVIDER_TESTNET', 'https://horizon-testnet.stellar.org')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns a valid config when providers are configured', () => {
    const config = getConfig()
    expect(config.network).toBe('testnet')
    expect(config.rpcProviders).toEqual(['https://soroban-testnet.stellar.org'])
    expect(config.horizonProviders).toEqual(['https://horizon-testnet.stellar.org'])
  })

  it('throws on an invalid STELLAR_NETWORK', () => {
    vi.stubEnv('STELLAR_NETWORK', 'mainet') // typo
    expect(() => getConfig()).toThrow(/Invalid STELLAR_NETWORK/)
  })

  it('throws on a non-numeric port instead of silently truncating it', () => {
    vi.stubEnv('RPC_PROXY_PORT', '8301abc')
    expect(() => getConfig()).toThrow(/Invalid RPC_PROXY_PORT/)
  })

  it('tolerates surrounding whitespace in a numeric env var', () => {
    vi.stubEnv('RPC_PROXY_PORT', ' 8301 ')
    expect(getConfig().rpcPort).toBe(8301)
  })

  it('throws on a port number outside the safe integer range', () => {
    vi.stubEnv('RPC_PROXY_PORT', '99999999999999999999')
    expect(() => getConfig()).toThrow(/Invalid RPC_PROXY_PORT/)
  })

  it('throws when no RPC providers are configured for the network', () => {
    vi.stubEnv('SDF_TESTNET_RPC', '')
    expect(() => getConfig()).toThrow(/No RPC providers configured/)
  })

  it('throws when no Horizon providers are configured for the network', () => {
    vi.stubEnv('HORIZON_PROVIDER_TESTNET', '')
    expect(() => getConfig()).toThrow(/No Horizon providers configured/)
  })

  it('RPC_PROVIDERS override takes precedence and satisfies the fail-fast check', () => {
    vi.stubEnv('SDF_TESTNET_RPC', '')
    vi.stubEnv('RPC_PROVIDERS', 'https://custom-rpc.example.com')
    const config = getConfig()
    expect(config.rpcProviders).toEqual(['https://custom-rpc.example.com'])
  })
})
