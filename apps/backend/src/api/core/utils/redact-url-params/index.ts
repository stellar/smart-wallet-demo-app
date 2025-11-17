import { REDACT_CENSOR } from 'api/core/constants/redact'

export const redactUrlParams = (url: string): string => {
  const decodedURI = decodeURIComponent(url)
  let redactedURL = decodedURI

  if (decodedURI.match(/\/phone\/\+\d+/)) {
    // Redact phone numbers in the format /phone/+<digits>
    redactedURL = redactedURL.replace(/\/phone\/\+\d+/g, `/phone/${REDACT_CENSOR}`)
  }
  if (decodedURI.match(/users\/email\//)) {
    // Redact email addresses in the format users/email/<email>
    redactedURL = redactedURL.replace(/[\w-.]+@[\w-]+\.[\w-]{2,4}/g, REDACT_CENSOR)
  }

  return redactedURL
}
