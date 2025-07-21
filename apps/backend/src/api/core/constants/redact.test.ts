import { LOGGER_SERIALIZERS, loggerRedactPaths, REDACT_CENSOR } from './redact'
import { redactUrlParams } from '../utils/redact-url-params'
import { redactUrlQueryParams } from '../utils/redact-url-query-params'

vi.mock('../utils/redact-url-params', () => ({
  redactUrlParams: vi.fn(url => url.replace(/pathSensitive/gi, REDACT_CENSOR)),
}))

vi.mock('../utils/redact-url-query-params', () => ({
  redactUrlQueryParams: vi.fn(url => url.replace(/querySensitive/gi, REDACT_CENSOR)),
}))

describe('LOGGER_SERIALIZERS', () => {
  describe('req serializer', () => {
    it('should redact sensitive data in req.url', () => {
      const url = 'http://example.com/pathSensitive/?data=querySensitive'
      const req = { url }
      const result = LOGGER_SERIALIZERS.req(req)
      expect(redactUrlParams).toHaveBeenCalledWith(url)
      expect(redactUrlQueryParams).toHaveBeenCalledWith(url.replace(/pathSensitive/gi, REDACT_CENSOR))
      expect(result.url).toBe(`http://example.com/${REDACT_CENSOR}/?data=${REDACT_CENSOR}`)
    })
  })

  describe('res serializer', () => {
    it('should redact sensitive data in res.url and res.request.url', () => {
      const url = 'http://example.com/pathSensitive/?data=querySensitive'
      const requestUrl = 'http://example.com/pathSensitive/?data=querySensitive'
      const res = {
        url,
        request: { url: requestUrl },
      }
      const result = LOGGER_SERIALIZERS.res(res)
      expect(redactUrlParams).toHaveBeenCalledWith(url)
      expect(redactUrlQueryParams).toHaveBeenCalledWith(url.replace(/pathSensitive/gi, REDACT_CENSOR))
      expect(result.url).toBe(`http://example.com/${REDACT_CENSOR}/?data=${REDACT_CENSOR}`)

      expect(redactUrlParams).toHaveBeenCalledWith(requestUrl)
      expect(redactUrlQueryParams).toHaveBeenCalledWith(requestUrl.replace(/pathSensitive/gi, REDACT_CENSOR))
      expect(result.request.url).toBe(`http://example.com/${REDACT_CENSOR}/?data=${REDACT_CENSOR}`)
    })
  })

  describe('err serializer', () => {
    it('should redact sensitive data in err.config.url, err.response.url, and err.response.request.url', () => {
      const configUrl = 'http://example.com/pathSensitive/?data=querySensitive'
      const responseUrl = 'http://example.com/pathSensitive/?data=querySensitive'
      const responseRequestUrl = 'http://example.com/pathSensitive/?data=querySensitive'
      const err = {
        config: { url: configUrl },
        response: {
          url: responseUrl,
          request: { url: responseRequestUrl },
        },
      }
      const result = LOGGER_SERIALIZERS.err(err)
      expect(redactUrlParams).toHaveBeenCalledWith(configUrl)
      expect(redactUrlQueryParams).toHaveBeenCalledWith(configUrl.replace(/pathSensitive/gi, REDACT_CENSOR))
      expect(result.config.url).toBe(`http://example.com/${REDACT_CENSOR}/?data=${REDACT_CENSOR}`)

      expect(redactUrlParams).toHaveBeenCalledWith(responseUrl)
      expect(redactUrlQueryParams).toHaveBeenCalledWith(responseUrl.replace(/pathSensitive/gi, REDACT_CENSOR))
      expect(result.response.url).toBe(`http://example.com/${REDACT_CENSOR}/?data=${REDACT_CENSOR}`)

      expect(redactUrlParams).toHaveBeenCalledWith(responseRequestUrl)
      expect(redactUrlQueryParams).toHaveBeenCalledWith(responseRequestUrl.replace(/pathSensitive/gi, REDACT_CENSOR))
      expect(result.response.request.url).toBe(`http://example.com/${REDACT_CENSOR}/?data=${REDACT_CENSOR}`)
    })
  })
})

describe('LOGGER_REDACT_PATHS', () => {
  const bannedHeaders = ['authorization', 'cookie']
  const bannedQueryParams = ['password', 'token']
  const bannedFields = ['creditCard', 'ssn']

  it('should generate correct paths for req', async () => {
    const paths = loggerRedactPaths(bannedHeaders, bannedQueryParams, bannedFields)['req']

    bannedHeaders.forEach(header => {
      expect(paths).toContain(`req.headers.${header}`)
    })
    bannedQueryParams.forEach(param => {
      expect(paths).toContain(`req.params.${param}`)
      expect(paths).toContain(`req.params[*].${param}`)
    })
    bannedFields.forEach(field => {
      expect(paths).toContain(`req.data.${field}`)
      expect(paths).toContain(`req.data[*].${field}`)
    })
  })

  it('should generate correct paths for res', async () => {
    const paths = loggerRedactPaths(bannedHeaders, bannedQueryParams, bannedFields)['res']

    bannedHeaders.forEach(header => {
      expect(paths).toContain(`res.headers.${header}`)
    })
    bannedQueryParams.forEach(param => {
      expect(paths).toContain(`res.params.${param}`)
      expect(paths).toContain(`res.params[*].${param}`)
    })
    bannedFields.forEach(field => {
      expect(paths).toContain(`res.data.${field}`)
      expect(paths).toContain(`res.data[*].${field}`)
    })
  })

  it('should generate correct paths for err.config', () => {
    const paths = loggerRedactPaths(bannedHeaders, bannedQueryParams, bannedFields)['err.config']

    bannedHeaders.forEach(header => {
      expect(paths).toContain(`err.config.headers.${header}`)
    })
    bannedQueryParams.forEach(param => {
      expect(paths).toContain(`err.config.params.${param}`)
      expect(paths).toContain(`err.config.params[*].${param}`)
    })
    bannedFields.forEach(field => {
      expect(paths).toContain(`err.config.data.${field}`)
      expect(paths).toContain(`err.config.data[*].${field}`)
    })
  })

  it('should generate correct paths for err.response', () => {
    const paths = loggerRedactPaths(bannedHeaders, bannedQueryParams, bannedFields)['err.response']

    bannedHeaders.forEach(header => {
      expect(paths).toContain(`err.response.headers.${header}`)
    })
    bannedQueryParams.forEach(param => {
      expect(paths).toContain(`err.response.params.${param}`)
      expect(paths).toContain(`err.response.params[*].${param}`)
    })
    bannedFields.forEach(field => {
      expect(paths).toContain(`err.response.data.${field}`)
      expect(paths).toContain(`err.response.data[*].${field}`)
    })
  })
})
