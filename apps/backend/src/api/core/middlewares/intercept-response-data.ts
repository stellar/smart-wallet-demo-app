// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextFunction, Request, Response } from 'express'

export function interceptResponseDataMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const originalResJson = res.json

  res.json = function (data): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    res.locals.responseRawData = data
    originalResJson.call(res, data)
  }
  next()
}
