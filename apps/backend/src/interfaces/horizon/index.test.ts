import axios from 'axios'
import { getValueFromEnv } from 'config/env-utils'
import Horizon, { CONNECTION_TIMEOUT } from '.'

describe('Horizon', () => {
  const connection = axios.create({
    baseURL: getValueFromEnv('HORIZON_API_URL', 'https://horizon-testnet.stellar.org'),
    timeout: CONNECTION_TIMEOUT,
  })
  const horizon = new Horizon(connection)

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('getAccountBalance', () => {
    test('should get a account/wallet balance', async () => {
      vi.spyOn(connection, 'get').mockResolvedValue({
        data: {
          id: 'GA...',
          account_id: 'GA...',
          balances: {
            balance: '4.9988448',
            asset_type: 'native',
          },
        },
        status: 200,
      })

      const response = await horizon.getAccountBalance({ address: 'GA...' })
      expect(response).toEqual({
        id: 'GA...',
        account_id: 'GA...',
        balances: {
          balance: '4.9988448',
          asset_type: 'native',
        },
      })
    })
  })
})
