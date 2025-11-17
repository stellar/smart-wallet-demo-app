/**
 * Generates a random alphanumeric string of the specified length.
 *
 * @param length - The desired length of the generated string.
 * @returns A string containing random uppercase alphanumeric characters.
 */

const randomAlphaNumeric = (length: number) => {
  let randomString: string = ''
  Array.from({ length }).some(() => {
    randomString += Math.random().toString(36).slice(2)
    return randomString.length >= length
  })
  return randomString.slice(0, length).toUpperCase()
}

export { randomAlphaNumeric }
