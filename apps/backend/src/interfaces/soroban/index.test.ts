import { xdr } from '@stellar/stellar-sdk'

import { getValueFromEnv } from 'config/env-utils'

import { ScConvert } from './helpers/sc-convert'
import { SimulateContractOperation } from './types'

import SorobanService from '.'

describe('Soroban', () => {
  const sorobanService = new SorobanService()

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('getContractBalance', () => {
    test('should get a contract account/wallet balance', async () => {
      const { simulationResponse } = await sorobanService.simulateContractOperation({
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        method: 'balance',
        args: [
          ScConvert.accountIdToScVal(
            getValueFromEnv(
              'STELLAR_SOURCE_ACCOUNT_PUBLIC_KEY',
              'GCUZ37M45SEMGYFYYZE7IBTS3ISKGPDLFRNHS73ORSTMNYM64NLEQO76'
            )
          ),
        ],
      } as SimulateContractOperation)

      expect(simulationResponse).toBeTypeOf('object')
      expect(ScConvert.scValToBigInt(simulationResponse.result?.retval as xdr.ScVal)).toBeTypeOf('bigint')
    })
  })
})
