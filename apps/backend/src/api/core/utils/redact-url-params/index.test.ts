import { REDACT_CENSOR } from 'api/core/constants/redact'

import { redactUrlParams } from './index'

describe('redactUrlParams', () => {
  it('should redact phone numbers in the URL', () => {
    const url = 'https://example.com/phone/+1234567890'
    const result = redactUrlParams(url)
    expect(result).toBe(`https://example.com/phone/${REDACT_CENSOR}`)
  })

  it('should redact email addresses in the URL', () => {
    const url = 'https://example.com/users/email/test@example.com'
    const result = redactUrlParams(url)
    expect(result).toBe(`https://example.com/users/email/${REDACT_CENSOR}`)
  })

  it('should handle URLs with both phone numbers and email addresses', () => {
    const url = 'https://example.com/phone/+1234567890/users/email/test@example.com'
    const result = redactUrlParams(url)
    expect(result).toBe(`https://example.com/phone/${REDACT_CENSOR}/users/email/${REDACT_CENSOR}`)
  })

  it('should return the original URL if no sensitive data is present', () => {
    const url = 'https://example.com/path/to/resource'
    const result = redactUrlParams(url)
    expect(result).toBe(url)
  })

  it('should handle encoded URLs with sensitive data', () => {
    const url = 'https%3A%2F%2Fexample.com%2Fphone%2F%2B1234567890%2Fusers%2Femail%2Ftest%40example.com'
    const result = redactUrlParams(url)
    expect(result).toBe(`https://example.com/phone/${REDACT_CENSOR}/users/email/${REDACT_CENSOR}`)
  })

  it('should handle URLs with no phone or email but other query parameters', () => {
    const url = 'https://example.com/path?param=value'
    const result = redactUrlParams(url)
    expect(result).toBe(url)
  })

  it('should handle URLs with partial matches that do not qualify as sensitive data', () => {
    const url = 'https://example.com/phone/abc123/users/email/not-an-email'
    const result = redactUrlParams(url)
    expect(result).toBe(url)
  })
})
