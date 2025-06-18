/* eslint-disable no-console */
class Logger {
  static instance: Logger

  private runIfNotProd(fn: () => void): void {
    if (!import.meta.env.PROD) {
      fn()
    }
  }

  log(...args: unknown[]): void {
    this.runIfNotProd(() => console.log(...args))
  }

  error(...args: unknown[]): void {
    this.runIfNotProd(() => console.error(...args))
  }

  warn(...args: unknown[]): void {
    this.runIfNotProd(() => console.warn(...args))
  }

  debug(...args: unknown[]): void {
    this.runIfNotProd(() => console.debug(...args))
  }
}

Logger.instance = new Logger()

export default Logger.instance
