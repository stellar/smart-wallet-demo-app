import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import express, { NextFunction, Request, Response, Router } from 'express'

function routes(http: express.Router): void {
  http.get('/health', (_req, res) => {
    res.status(HttpStatusCodes.OK).send()
  })
}

export { routes, Request, Response, Router, NextFunction }
