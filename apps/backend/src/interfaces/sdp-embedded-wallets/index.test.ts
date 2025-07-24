import axios from 'axios'

import { getValueFromEnv } from 'config/env-utils'

import { WalletStatus } from './types'

import SDPEmbeddedWallets, { CONNECTION_TIMEOUT } from '.'

describe('SDPEmbeddedWallets', () => {
  const connection = axios.create({
    baseURL: getValueFromEnv(
      'SDP_EMBEDDED_WALLETS_URL',
      'https://stellar-disbursement-platform-backend-dev.stellar.org/embedded-wallets'
    ),
    timeout: CONNECTION_TIMEOUT,
    headers: {
      Authorization: getValueFromEnv('SDP_EMBEDDED_WALLETS_API_KEY'),
    },
  })
  const sdpEmbeddedWallets = new SDPEmbeddedWallets(connection)

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('createWallet', () => {
    test('should create a wallet', async () => {
      vi.spyOn(connection, 'post').mockResolvedValue({
        data: {
          status: 'PENDING',
        },
        status: 200,
      })

      const response = await sdpEmbeddedWallets.createWallet({
        token: 'token',
        public_key: 'public_key',
        credential_id: 'credential_id',
      })
      expect(response).toEqual({ status: WalletStatus.PENDING })
    })

    test('should throw an error if the request fails', async () => {
      vi.spyOn(connection, 'post').mockRejectedValueOnce(new Error('Request failed'))

      await expect(
        sdpEmbeddedWallets.createWallet({
          token: 'token',
          public_key: 'public_key',
          credential_id: 'credential_id',
        })
      ).rejects.toThrowError()
    })
  })

  describe('checkWalletStatus', () => {
    test('should check the wallet status - PROCESSING case', async () => {
      vi.spyOn(connection, 'get').mockResolvedValue({
        data: {
          status: 'PROCESSING',
          receiver_contact: 'hello@example.com',
          contact_type: 'EMAIL',
        },
        status: 200,
      })

      const response = await sdpEmbeddedWallets.checkWalletStatus('token')
      expect(response).toEqual({
        status: WalletStatus.PROCESSING,
        receiver_contact: 'hello@example.com',
        contact_type: 'EMAIL',
      })
    })

    test('should check the wallet status - SUCCESS case', async () => {
      vi.spyOn(connection, 'get').mockResolvedValue({
        data: {
          status: 'SUCCESS',
          contract_address: 'C...',
          receiver_contact: 'hello@example.com',
          contact_type: 'EMAIL',
        },
        status: 200,
      })

      const response = await sdpEmbeddedWallets.checkWalletStatus('token')
      expect(response).toEqual({
        status: WalletStatus.SUCCESS,
        contract_address: 'C...',
        receiver_contact: 'hello@example.com',
        contact_type: 'EMAIL',
      })
    })

    test('should throw an error if the request fails', async () => {
      vi.spyOn(connection, 'get').mockRejectedValueOnce(new Error('Request failed'))

      await expect(sdpEmbeddedWallets.checkWalletStatus('token')).rejects.toThrowError()
    })
  })

  describe('getContractAddress', () => {
    test('should get the contract address - PROCESSING case', async () => {
      vi.spyOn(connection, 'get').mockResolvedValue({
        data: {
          status: 'PROCESSING',
        },
        status: 200,
      })

      const response = await sdpEmbeddedWallets.getContractAddress('id')
      expect(response).toEqual({ status: WalletStatus.PROCESSING })
    })

    test('should get the contract address - SUCCESS case', async () => {
      vi.spyOn(connection, 'get').mockResolvedValue({
        data: {
          status: 'SUCCESS',
          contract_address: 'C...',
        },
        status: 200,
      })

      const response = await sdpEmbeddedWallets.getContractAddress('id')
      expect(response).toEqual({ status: WalletStatus.SUCCESS, contract_address: 'C...' })
    })

    test('should throw an error if the request fails', async () => {
      vi.spyOn(connection, 'get').mockRejectedValueOnce(new Error('Request failed'))

      await expect(sdpEmbeddedWallets.getContractAddress('id')).rejects.toThrowError()
    })
  })
})
