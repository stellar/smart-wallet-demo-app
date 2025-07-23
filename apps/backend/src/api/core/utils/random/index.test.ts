import { randomAlphaNumeric } from './index'

describe('randomAlphaNumeric', () => {
  it('should generate a string of the specified length', () => {
    const length = 10
    const result = randomAlphaNumeric(length)
    expect(result).toHaveLength(length)
  })

  it('should only contain alphanumeric characters', () => {
    const result = randomAlphaNumeric(20)
    expect(result).toMatch(/^[a-zA-Z0-9]+$/)
  })

  it('should return an empty string if length is 0', () => {
    expect(randomAlphaNumeric(0)).toBe('')
  })

  it('should generate different strings for consecutive calls', () => {
    const first = randomAlphaNumeric(8)
    const second = randomAlphaNumeric(8)
    expect(first).not.toBe(second)
  })

  it('should throw or handle negative length gracefully', () => {
    expect(() => randomAlphaNumeric(-5)).not.toThrow()
    expect(randomAlphaNumeric(-5)).toBe('')
  })
})
