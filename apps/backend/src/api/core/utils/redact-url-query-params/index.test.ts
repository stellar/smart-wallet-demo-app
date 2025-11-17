import { redactUrlQueryParams } from './index'

describe('redactUrlQueryParams', () => {
  const REDACT_BANNED_QUERY_PARAMS = ['password', 'token', 'secret']
  const REDACT_CENSOR = 'REDACTED'

  it('should redact banned query parameters', () => {
    const url = 'https://example.com?password=12345&token=abcde&user=john'
    const result = redactUrlQueryParams(url, {
      redactBannedQueryParams: REDACT_BANNED_QUERY_PARAMS,
      redactSensor: REDACT_CENSOR,
    })
    expect(result).toBe('https://example.com?password=REDACTED&token=REDACTED&user=john')
  })

  it('should return the same URL if no query parameters are present', () => {
    const url = 'https://example.com'
    const result = redactUrlQueryParams(url, {
      redactBannedQueryParams: REDACT_BANNED_QUERY_PARAMS,
      redactSensor: REDACT_CENSOR,
    })
    expect(result).toBe(url)
  })

  it('should return the same URL if no banned query parameters are present', () => {
    const url = 'https://example.com?user=john&age=30'
    const result = redactUrlQueryParams(url, {
      redactBannedQueryParams: REDACT_BANNED_QUERY_PARAMS,
      redactSensor: REDACT_CENSOR,
    })
    expect(result).toBe(url)
  })

  it('should handle URLs with multiple banned query parameters', () => {
    const url = 'https://example.com?password=12345&token=abcde&secret=xyz'
    const result = redactUrlQueryParams(url, {
      redactBannedQueryParams: REDACT_BANNED_QUERY_PARAMS,
      redactSensor: REDACT_CENSOR,
    })
    expect(result).toBe('https://example.com?password=REDACTED&token=REDACTED&secret=REDACTED')
  })

  it('should handle URLs with empty query parameters', () => {
    const url = 'https://example.com?password=&token=&user=john'
    const result = redactUrlQueryParams(url, {
      redactBannedQueryParams: REDACT_BANNED_QUERY_PARAMS,
      redactSensor: REDACT_CENSOR,
    })
    expect(result).toBe('https://example.com?password=REDACTED&token=REDACTED&user=john')
  })

  it('should handle URLs with encoded query parameters', () => {
    const url = 'https://example.com?password=12345&token=abc%20de&user=john'
    const result = redactUrlQueryParams(url, {
      redactBannedQueryParams: REDACT_BANNED_QUERY_PARAMS,
      redactSensor: REDACT_CENSOR,
    })
    expect(result).toBe('https://example.com?password=REDACTED&token=REDACTED&user=john')
  })
})
