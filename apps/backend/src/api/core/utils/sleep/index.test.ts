import { sleep, sleepInSeconds } from '.'

describe('sleep utility function', () => {
  it('sleep function should delay execution for the specified time', async () => {
    vi.useFakeTimers()

    const startTime = Date.now()
    let hasResolved = false

    const sleepPromise = sleep(1000).then(() => {
      hasResolved = true
    })

    vi.advanceTimersByTime(500)
    expect(hasResolved).toBe(false)

    vi.advanceTimersByTime(500)
    await sleepPromise

    expect(hasResolved).toBe(true)

    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThanOrEqual(1000)

    vi.useRealTimers()
  })

  it('sleep function should resolve immediately for 0ms', async () => {
    vi.useFakeTimers()

    let hasResolved = false
    const sleepPromise = sleep(0).then(() => {
      hasResolved = true
    })

    vi.advanceTimersByTime(0)
    await sleepPromise

    expect(hasResolved).toBe(true)

    vi.useRealTimers()
  })

  it('sleepInSeconds function should delay execution for the specified seconds', async () => {
    vi.useFakeTimers()

    const startTime = Date.now()
    let hasResolved = false

    const sleepPromise = sleepInSeconds(1).then(() => {
      hasResolved = true
    })

    vi.advanceTimersByTime(500)
    expect(hasResolved).toBe(false)

    vi.advanceTimersByTime(500)
    await sleepPromise

    expect(hasResolved).toBe(true)

    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThanOrEqual(1000)

    vi.useRealTimers()
  })
})
