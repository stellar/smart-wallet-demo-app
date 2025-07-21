import { formatNumber } from '.'

describe('formatNumber', () => {
  test('formats number with default options', () => {
    expect(formatNumber(1234.5678)).toBe('1,234.5678')
  })

  test('limits formatted string to charLimit', () => {
    // charLimit = 7, should reduce fraction digits
    expect(formatNumber(1234.56789, 'en-US', 7)).toBe('1,234.57')
  })

  test('returns fallback if cannot fit within charLimit', () => {
    // charLimit = 5, can't fit, fallback to minFraction
    expect(formatNumber(1234567.89, 'en-US', 5)).toBe('1,234,567.89')
  })

  test('formats with custom locale', () => {
    expect(formatNumber(1234.5678, 'de-DE')).toBe('1.234,5678')
  })

  test('formats with custom minFraction and maxFraction', () => {
    expect(formatNumber(12.345678, 'en-US', 14, 1, 2)).toBe('12.35')
  })

  test('formats integer numbers', () => {
    expect(formatNumber(1000)).toBe('1,000.00')
  })

  test('formats small numbers', () => {
    expect(formatNumber(0.123456)).toBe('0.1235')
  })

  test('formats negative numbers', () => {
    expect(formatNumber(-1234.5678)).toBe('-1,234.5678')
  })
})
