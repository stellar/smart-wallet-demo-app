import axios from 'axios'

import { getValueFromEnv } from 'config/env-utils'

import WalletBackend, { CONNECTION_TIMEOUT } from '.'

describe('WalletBackend', () => {
  const connection = axios.create({
    baseURL: getValueFromEnv(
      'STELLAR_WALLET_BACKEND_URL',
      'https://wallet-backend-testnet-21ac687b8418.herokuapp.com'
    ),
    timeout: CONNECTION_TIMEOUT,
  })
  const walletBackend = new WalletBackend(connection)

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('registerAccount', () => {
    test('should register an account within wallet backend service', async () => {
      /* vi.spyOn(connection, 'post').mockResolvedValue({
        data: {
          // status: 'PENDING',
        },
        status: 200,
      }) */

      const response = await walletBackend.registerAccount({
        address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE'
      })

      console.log('response >>>', response)
      
      expect(response).toEqual({})
    })

    /* test('should throw an error if the request fails', async () => {
      vi.spyOn(connection, 'post').mockRejectedValueOnce(new Error('Request failed'))

      await expect(
        sdpEmbeddedWallets.createWallet({
          token: 'token',
          public_key: 'public_key',
          credential_id: 'credential_id',
        })
      ).rejects.toThrowError()
    }) */
  })

  describe('deregisterAccount', () => {
    test('should deregister an account from wallet backend service', async () => {
      vi.spyOn(connection, 'post').mockResolvedValue({
        data: {
          // status: 'PENDING',
        },
        status: 200,
      })

      const response = await walletBackend.deregisterAccount({
        address: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE'
      })

      console.log('response >>>', response)
      
      expect(response).toEqual({})
    })

    /* test('should throw an error if the request fails', async () => {
      vi.spyOn(connection, 'post').mockRejectedValueOnce(new Error('Request failed'))

      await expect(
        sdpEmbeddedWallets.createWallet({
          token: 'token',
          public_key: 'public_key',
          credential_id: 'credential_id',
        })
      ).rejects.toThrowError()
    }) */
  })
})