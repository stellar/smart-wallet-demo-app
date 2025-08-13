import 'express-async-errors'
import express, { NextFunction, Request, Response, Router } from 'express'

import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import embeddedWalletsRoutes from '../embedded-wallets/routes'
import { router as featureFlagsRoutes, adminRouter as adminFeatureFlagsRoutes } from '../feature-flags/routes'

function routes(http: express.Router): void {
  http.get('/health', (_req, res) => {
    res.status(HttpStatusCodes.OK).send()
  })

  http.use('/api/embedded-wallets', embeddedWalletsRoutes)
  http.use('/api/feature-flags', featureFlagsRoutes)

  http.use('/api/admin/feature-flags', adminFeatureFlagsRoutes)
}

export { routes, Request, Response, Router, NextFunction }
