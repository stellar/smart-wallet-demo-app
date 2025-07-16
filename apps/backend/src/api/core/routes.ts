import 'express-async-errors'
import express, { NextFunction, Request, Response, Router } from 'express'

import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import embeddedWalletsRoutes from '../embedded-wallets/routes'
import proofRoutes from '../proofs/routes'

function routes(http: express.Router): void {
  http.get('/health', (_req, res) => {
    res.status(HttpStatusCodes.OK).send()
  })

  http.use('/api/proofs', proofRoutes)
  http.use('/api/embedded-wallets', embeddedWalletsRoutes)
}

export { routes, Request, Response, Router, NextFunction }
