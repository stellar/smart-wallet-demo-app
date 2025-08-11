import axios from 'axios'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { fetchSep50Metadata, Sep50Metadata } from '.'

// Mock axios
vi.mock('axios')

// Define proper mock type for axios
type MockedAxios = {
  get: {
    mockResolvedValueOnce: (value: { status: number; data: Sep50Metadata | string | null }) => MockedAxios['get']
    mockRejectedValueOnce: (value: Error) => MockedAxios['get']
    toHaveBeenCalledWith: (url: string, config: { timeout: number; headers: Record<string, string> }) => void
  }
}

const mockedAxios = axios as unknown as MockedAxios

describe('fetchSep50Metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully fetch and return metadata', async () => {
    const mockMetadata: Sep50Metadata = {
      name: 'Test NFT',
      description: 'A test NFT for testing purposes',
      image: 'https://example.com/image.png',
      external_url: 'https://example.com',
      attributes: [
        {
          trait_type: 'Rarity',
          value: 'Legendary',
          display_type: 'string',
        },
      ],
    }

    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetadata,
    })

    const result = await fetchSep50Metadata('https://example.com/metadata.json')

    expect(result).toEqual(mockMetadata)
    expect(mockedAxios.get).toHaveBeenCalledWith('https://example.com/metadata.json', {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SmartWallet/1.0',
      },
    })
  })

  it('should handle invalid JSON responses', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: 'invalid json string',
    })

    await expect(fetchSep50Metadata('https://example.com/invalid.json')).rejects.toThrow(
      'Invalid metadata format: expected JSON object'
    )
  })

  it('should handle null responses', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: null,
    })

    await expect(fetchSep50Metadata('https://example.com/null.json')).rejects.toThrow(
      'Invalid metadata format: expected JSON object'
    )
  })

  it('should handle missing optional fields gracefully', async () => {
    const minimalMetadata: Sep50Metadata = {
      name: 'Minimal NFT',
    }

    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: minimalMetadata,
    })

    const result = await fetchSep50Metadata('https://example.com/minimal.json')

    expect(result).toEqual(minimalMetadata)
    expect(result.description).toBeUndefined()
    expect(result.image).toBeUndefined()
  })

  it('should handle complex metadata with all fields', async () => {
    const complexMetadata: Sep50Metadata = {
      name: 'Complex NFT',
      description: 'A complex NFT with many attributes',
      image: 'https://example.com/image.png',
      image_data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+',
      external_url: 'https://example.com',
      animation_url: 'https://example.com/animation.mp4',
      background_color: '000000',
      name_prefix: 'Rare',
      name_suffix: 'Edition',
      collection: {
        name: 'Test Collection',
        family: 'Test Family',
      },
      attributes: [
        {
          trait_type: 'Rarity',
          value: 'Legendary',
          display_type: 'string',
        },
        {
          trait_type: 'Level',
          value: 99,
          max_value: 100,
        },
      ],
      properties: {
        files: [
          {
            type: 'image/png',
            uri: 'https://example.com/image.png',
          },
        ],
      },
    }

    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: complexMetadata,
    })

    const result = await fetchSep50Metadata('https://example.com/complex.json')

    expect(result).toEqual(complexMetadata)
    expect(result.attributes).toHaveLength(2)
    expect(result.collection?.name).toBe('Test Collection')
    expect(result.properties?.files).toBeDefined()
  })
})
