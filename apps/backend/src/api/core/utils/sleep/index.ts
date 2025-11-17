export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function sleepInSeconds(seconds: number): Promise<void> {
  return sleep(seconds * 1000)
}
