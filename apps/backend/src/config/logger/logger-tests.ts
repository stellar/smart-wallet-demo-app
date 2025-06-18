import { logger } from './index'

const methods: (keyof typeof logger)[] = ['info', 'error', 'warn', 'debug', 'fatal']

describe('logger', () => {
  methods.forEach(method => {
    test(`It must call ${method} method`, () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const spy = vi.spyOn(logger, method)
      logger[method]({ message: 'Test log message' }, 'Test log message')
      expect(spy).toHaveBeenCalledWith({ message: 'Test log message' }, 'Test log message')
      spy.mockRestore()
    })
  })
})
