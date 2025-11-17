import { xdr } from '@stellar/stellar-sdk'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { ISorobanService } from 'interfaces/soroban/types'

import { getTokenData } from '.'

// Mock the dependencies
vi.mock('api/core/services/asset')
vi.mock('api/core/services/nft')
vi.mock('interfaces/soroban')
vi.mock('api/core/utils/fetch-sep50-metadata')

describe('getTokenData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return token data with basic fields when no metadata is available', async () => {
    // Mock the soroban service responses with proper XDR objects
    const mockSorobanService: Partial<ISorobanService> = {
      simulateContractOperation: vi
        .fn()
        .mockResolvedValueOnce({
          simulationResponse: {
            result: { retval: xdr.ScVal.scvString('TEST') },
          },
        })
        .mockResolvedValueOnce({
          simulationResponse: {
            result: { retval: xdr.ScVal.scvString('Test Token') },
          },
        })
        .mockResolvedValueOnce({
          simulationResponse: {
            result: { retval: xdr.ScVal.scvString('https://example.com/metadata.json') },
          },
        }),
    }

    // Mock the fetchSep50Metadata to return empty metadata
    const { fetchSep50Metadata } = await import('api/core/utils/fetch-sep50-metadata')
    vi.mocked(fetchSep50Metadata).mockResolvedValue({})

    const result = await getTokenData({
      assetContractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
      sorobanService: mockSorobanService as ISorobanService,
    })

    expect(result).toEqual({
      symbol: 'TEST',
      name: 'Test Token',
      description: '',
      url: '',
      image: '',
      externalUrl: '',
      collection: undefined,
      attributes: undefined,
      properties: undefined,
    })
  })

  it.skip('should return token data with full metadata when available', async () => {
    // Mock the soroban service responses with proper XDR objects
    const mockSorobanService: Partial<ISorobanService> = {
      simulateContractOperation: vi
        .fn()
        .mockResolvedValueOnce({
          simulationResponse: {
            result: { retval: xdr.ScVal.scvString('NFT') },
          },
        })
        .mockResolvedValueOnce({
          simulationResponse: {
            result: { retval: xdr.ScVal.scvString('My NFT Collection') },
          },
        })
        .mockResolvedValueOnce({
          simulationResponse: {
            result: { retval: xdr.ScVal.scvString('https://example.com/metadata.json') },
          },
        }),
    }

    // Mock the fetchSep50Metadata to return rich metadata
    const { fetchSep50Metadata } = await import('api/core/utils/fetch-sep50-metadata')
    vi.mocked(fetchSep50Metadata).mockResolvedValue({
      description: 'A beautiful NFT',
      external_url: 'https://example.com',
      image: 'https://example.com/image.png',
      collection: {
        name: 'My Collection',
        family: 'Art',
      },
      attributes: [
        {
          trait_type: 'Rarity',
          value: 'Legendary',
        },
      ],
    })

    const result = await getTokenData({
      assetContractAddress: 'CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE',
      sorobanService: mockSorobanService as ISorobanService,
    })

    expect(result).toEqual({
      symbol: 'NFT',
      name: 'My NFT Collection',
      description: 'A beautiful NFT',
      url: 'https://example.com',
      image: 'https://example.com/image.png',
      externalUrl: 'https://example.com',
      collection: {
        name: 'My Collection',
        family: 'Art',
      },
      attributes: [
        {
          traitType: 'Rarity',
          value: 'Legendary',
          displayType: undefined,
          maxValue: undefined,
        },
      ],
      properties: undefined,
    })
  })
})
