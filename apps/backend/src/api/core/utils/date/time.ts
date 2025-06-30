export function getEpochSeconds(): number {
  const currentTimeInMilliseconds = Date.now()
  return currentTimeInMilliseconds / 1000
}
