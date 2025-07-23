import { getValueFromEnv } from 'config/env-utils'

import { StellarConfig } from './types'

// STELLAR constants for the project, used to get data and submit transaction to the Horizon and Soroban servers.
export const STELLAR: StellarConfig = {
  NETWORK_PASSPHRASE: getValueFromEnv('STELLAR_NETWORK_PASSPHRASE') || 'Test SDF Network ; September 2015',
  HORIZON_URL: getValueFromEnv('STELLAR_HORIZON_URL') || 'https://horizon-testnet.stellar.org',
  SOROBAN_RPC_URL: getValueFromEnv('STELLAR_SOROBAN_RPC_URL') || 'https://soroban-testnet.stellar.org',
  MAX_FEE: getValueFromEnv('STELLAR_MAX_FEE') || '10000',
  SOURCE_ACCOUNT: {
    PRIVATE_KEY:
      getValueFromEnv('STELLAR_SOURCE_ACCOUNT_PRIVATE_KEY') ||
      'SAARF2ZWAHZJMKA6LXIFVNIHUBEUTMKV5NWCCUZV6ORPKLUK6RSOYZ4D',
    PUBLIC_KEY:
      getValueFromEnv('STELLAR_SOURCE_ACCOUNT_PUBLIC_KEY') ||
      'GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5',
  },
  TOKEN_CONTRACT: { // TODO: get these values from backoffice
    NATIVE:
      getValueFromEnv('STELLAR_TOKEN_CONTRACT_NATIVE') || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    USDC: getValueFromEnv('STELLAR_TOKEN_CONTRACT_USDC') || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  },
}
