import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import express, { NextFunction, Request, Response, Router } from 'express'
import proofRoutes from '../proofs/routes'

function routes(http: express.Router): void {
  http.get('/health', (_req, res) => {
    res.status(HttpStatusCodes.OK).send()
  })

  http.use('/api/proofs', proofRoutes)
}

export { routes, Request, Response, Router, NextFunction }
