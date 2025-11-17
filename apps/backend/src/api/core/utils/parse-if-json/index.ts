export const parseIfJson = (input: string | object | unknown): string | object | unknown => {
  try {
    if (typeof input !== 'string') {
      throw Error('Input is not a string')
    }

    // Attempt to parse the input
    const parsed = JSON.parse(input) as unknown
    return parsed // Return the parsed JSON if successful
  } catch {
    // If parsing fails OR input is not a string, return the input as it is
    return input
  }
}
