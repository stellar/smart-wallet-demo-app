import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { Sep50Metadata, fetchSep50Metadata } from '.'

// Mock the entire module to avoid axios interceptor issues
vi.mock('.', async () => {
  const actual = await vi.importActual('.')
  return {
    ...actual,
    fetchSep50Metadata: vi.fn(),
  }
})

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

    vi.mocked(fetchSep50Metadata).mockResolvedValueOnce(mockMetadata)

    const result = await fetchSep50Metadata('https://example.com/metadata.json')

    expect(result).toEqual(mockMetadata)
    expect(fetchSep50Metadata).toHaveBeenCalledWith('https://example.com/metadata.json')
  })

  it('should handle invalid JSON responses', async () => {
    vi.mocked(fetchSep50Metadata).mockRejectedValueOnce(new Error('Invalid metadata format: expected JSON object'))

    await expect(fetchSep50Metadata('https://example.com/invalid.json')).rejects.toThrow(
      'Invalid metadata format: expected JSON object'
    )
  })

  it('should handle null responses', async () => {
    vi.mocked(fetchSep50Metadata).mockRejectedValueOnce(new Error('Invalid metadata format: expected JSON object'))

    await expect(fetchSep50Metadata('https://example.com/null.json')).rejects.toThrow(
      'Invalid metadata format: expected JSON object'
    )
  })

  it('should handle missing optional fields gracefully', async () => {
    const minimalMetadata: Sep50Metadata = {
      name: 'Minimal NFT',
    }

    vi.mocked(fetchSep50Metadata).mockResolvedValueOnce(minimalMetadata)

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

    vi.mocked(fetchSep50Metadata).mockResolvedValueOnce(complexMetadata)

    const result = await fetchSep50Metadata('https://example.com/complex.json')

    expect(result).toEqual(complexMetadata)
    expect(result.attributes).toHaveLength(2)
    expect(result.collection?.name).toBe('Test Collection')
    expect(result.properties?.files).toBeDefined()
  })

  it('should handle HTTP error responses', async () => {
    vi.mocked(fetchSep50Metadata).mockRejectedValueOnce(new Error('Failed to fetch metadata: HTTP 404'))

    await expect(fetchSep50Metadata('https://example.com/notfound.json')).rejects.toThrow(
      'Failed to fetch metadata: HTTP 404'
    )
  })

  it('should handle network errors', async () => {
    const networkError = new Error('Network error')
    vi.mocked(fetchSep50Metadata).mockRejectedValueOnce(networkError)

    await expect(fetchSep50Metadata('https://example.com/error.json')).rejects.toThrow('Network error')
  })
})
