import { Request, Response } from 'express'

import { FeatureFlagRepositoryType } from 'api/core/entities/feature-flag/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import FeatureFlagRepository from 'api/core/services/feature-flag'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetFeatureFlags extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private featureFlagRepository: FeatureFlagRepositoryType

  constructor(featureFlagRepository?: FeatureFlagRepositoryType) {
    super()
    this.featureFlagRepository = featureFlagRepository || FeatureFlagRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle() {
    const flags = await this.featureFlagRepository.getFeatureFlags()

    return {
      data: {
        flags,
      },
      message: 'Retrieved feature flags successfully',
    }
  }
}

export { endpoint }
