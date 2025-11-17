import { NextFunction, Request, Response } from 'express'

export function initLogMetadata(_req: Request, res: Response, next: NextFunction): void {
  res.locals.logMetadata = new Set()

  const onResponseComplete = (): void => {
    res.locals.logMetadata?.clear()
    res.removeListener('finish', onResponseComplete)
    res.removeListener('close', onResponseComplete)
    res.removeListener('error', onResponseComplete)
  }

  res.on('finish', () => onResponseComplete)
  res.on('close', () => onResponseComplete)
  res.on('error', () => onResponseComplete)

  next()
}
