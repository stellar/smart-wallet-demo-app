import 'express-async-errors'
import express, { NextFunction, Request, Response, Router } from 'express'

import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import embeddedWalletsRoutes from '../embedded-wallets/routes'
import {
  featureFlagsRoutes,
  adminFeatureFlagsRoutes,
  adminAssetsRoutes,
  adminNftSupplyRoutes,
  adminVendorsRoutes,
  adminNgosRoutes,
  ngosRoutes,
} from '../general-settings/routes'

function routes(http: express.Router): void {
  http.get('/health', (_req, res) => {
    res.status(HttpStatusCodes.OK).send()
  })

  http.use('/api/embedded-wallets', embeddedWalletsRoutes)
  http.use('/api/feature-flags', featureFlagsRoutes)
  http.use('/api/ngos', ngosRoutes)

  http.use('/api/admin/feature-flags', adminFeatureFlagsRoutes)
  http.use('/api/admin/assets', adminAssetsRoutes)
  http.use('/api/admin/nft-collections', adminNftSupplyRoutes)
  http.use('/api/admin/vendors', adminVendorsRoutes)
  http.use('/api/admin/ngos', adminNgosRoutes)
}

export { routes, Request, Response, Router, NextFunction }
