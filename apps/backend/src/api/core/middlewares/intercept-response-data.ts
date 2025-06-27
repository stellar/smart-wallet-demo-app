import { NextFunction, Request, Response } from 'express'

export function interceptResponseDataMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const originalResJson = res.json.bind(res)

  res.json = ((data: unknown) => {
    res.locals.responseRawData = data
    return originalResJson(data)
  }) as typeof res.json

  next()
}
