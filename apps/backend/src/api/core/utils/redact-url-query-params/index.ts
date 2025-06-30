import { REDACT_BANNED_QUERY_PARAMS, REDACT_CENSOR } from 'api/core/constants/redact'

export const redactUrlQueryParams = (
  url: string,
  options = { redactBannedQueryParams: REDACT_BANNED_QUERY_PARAMS, redactSensor: REDACT_CENSOR }
): string => {
  const [path, queryParams] = url.split('?')
  if (!queryParams) return url
  const searchParams = new URLSearchParams(queryParams)

  searchParams.forEach((_, key) => {
    if (options.redactBannedQueryParams.includes(key)) searchParams.set(key, options.redactSensor)
  })

  return `${path}?${searchParams}`
}
