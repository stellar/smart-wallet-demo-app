import { logger } from 'config/logger'

import { Retryable } from './interface'

vi.mock('config/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}))

describe('Retryable.retry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve immediately if fn succeeds on first try', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const result = await Retryable.retry(fn)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('should retry until fn succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('finally success')

    const result = await Retryable.retry(fn, 3, 1) // small baseDelay for test speed

    expect(result).toBe('finally success')
    expect(fn).toHaveBeenCalledTimes(3)
    expect(logger.warn).toHaveBeenCalledTimes(2)
  })

  it('should throw last error after all retries fail', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))

    await expect(Retryable.retry(fn, 2, 1)).rejects.toThrow('always fails')

    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
    expect(logger.warn).toHaveBeenCalledTimes(2)
  })

  it('should log retry messages with attempt count', async () => {
    const error = new Error('fail')
    const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValue('ok')

    await Retryable.retry(fn, 2, 1)

    expect(logger.warn).toHaveBeenCalledWith(error, expect.stringContaining('Attempt 1 failed'))
  })
})
