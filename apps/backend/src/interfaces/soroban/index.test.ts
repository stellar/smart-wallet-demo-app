import { getValueFromEnv } from 'config/env-utils'

import { ScConvert } from './helpers/sc-convert'
import { SimulateContract } from './types'

import { Soroban } from '.'

describe('Soroban', () => {
  const sorobanService = new Soroban()

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('getContractBalance', () => {
    test('should get a contract account/wallet balance', async () => {
      const { simulationResponse } = await sorobanService.simulateContract({
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        method: 'balance',
        args: [
          ScConvert.accountIdToScVal(
            getValueFromEnv(
              'STELLAR_SOURCE_ACCOUNT_PUBLIC_KEY',
              'GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5'
            )
          ),
        ],
      } as SimulateContract)

      expect(simulationResponse).toBeTypeOf('object')
      expect(ScConvert.scValToBigInt(simulationResponse.result!.retval)).toBeTypeOf('bigint')
      // expect(response).toEqual({
      //   tx: {},
      //   simulationResponse: {},
      // })
    })
    /* test('should throw an error if the request fails', async () => {
      const { simulationResponse } = await sorobanService.simulateContract({ 
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        method: 'balance',
        args: [ScConvert.accountIdToScVal('GA223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG')] // Wrong account
      } as SimulateContract)

      console.log('simulationResponse >>>', simulationResponse)

      expect(simulationResponse).toThrowError()
    }) */
  })
})
