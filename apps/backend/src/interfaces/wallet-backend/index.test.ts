import axios from 'axios'

import { getValueFromEnv } from 'config/env-utils'

import WalletBackend, { CONNECTION_TIMEOUT } from '.'

describe('WalletBackend', () => {
  const connection = axios.create({
    baseURL: getValueFromEnv('STELLAR_WALLET_BACKEND_URL', 'https://wallet-backend-testnet-21ac687b8418.herokuapp.com'),
    timeout: CONNECTION_TIMEOUT,
  })
  const walletBackend = new WalletBackend(connection)

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('registerAccount', () => {
    test('should register an account within wallet backend service', async () => {
      vi.spyOn(connection, 'post').mockResolvedValue({
        data: {},
        status: 200,
      })

      const response = await walletBackend.registerAccount({
        address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
      })

      expect(response).toEqual({})
    })

    test('should throw an error if the request fails', async () => {
      vi.spyOn(connection, 'post').mockRejectedValueOnce(new Error('Request failed'))

      vi.spyOn(connection, 'post').mockResolvedValue({
        data: {
          error: 'Validation error.',
          extras: {
            address: 'Invalid public key provided',
          },
        },
        status: 400,
      })

      await expect(
        walletBackend.registerAccount({
          address: 'invalid_address',
        })
      ).rejects.toThrowError()
    })
  })

  describe('deregisterAccount', () => {
    test('should deregister an account from wallet backend service', async () => {
      vi.spyOn(connection, 'delete').mockResolvedValue({
        data: {},
        status: 200,
      })

      const response = await walletBackend.deregisterAccount({
        address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
      })

      expect(response).toEqual({})
    })

    test('should throw an error if the request fails', async () => {
      vi.spyOn(connection, 'delete').mockRejectedValueOnce(new Error('Request failed'))

      vi.spyOn(connection, 'delete').mockResolvedValue({
        data: {
          error: 'Validation error.',
          extras: {
            address: 'Invalid public key provided',
          },
        },
        status: 400,
      })

      await expect(
        walletBackend.deregisterAccount({
          address: 'invalid_address',
        })
      ).rejects.toThrowError()
    })
  })

  describe('getTransactions', () => {
    test('should get transactions from wallet backend service', async () => {
      const mockResponse = {
        data: {
          data: {
            account: {
              address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
              transactions: [],
            },
          },
        },
        status: 200,
      }

      vi.spyOn(connection, 'post').mockResolvedValue(mockResponse)

      const response = await walletBackend.getTransactions({
        address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
      })

      expect(response).toEqual(mockResponse.data.data)
    })

    test('should throw if the request fails', async () => {
      vi.spyOn(connection, 'post').mockRejectedValueOnce(new Error('Network error'))
      await expect(walletBackend.getTransactions({ address: 'CAZDTOP...' })).rejects.toThrowError()
    })

    test('should handle missing transactions field', async () => {
      vi.spyOn(connection, 'post').mockResolvedValue({
        data: {
          data: {
            account: {
              address: 'CAZDTOP...',
            },
          },
        },
        status: 200,
      })
      const response = await walletBackend.getTransactions({ address: 'CAZDTOP...' })
      expect(response.account.transactions).toBeUndefined()
    })
  })
})
