import { Request, Response } from 'express'

import { FeatureFlag, FeatureFlagRepositoryType } from 'api/core/entities/feature-flag/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import FeatureFlagRepository from 'api/core/services/feature-flag'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class CreateFeatureFlag extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private featureFlagRepository: FeatureFlagRepositoryType

  constructor(featureFlagRepository?: FeatureFlagRepositoryType) {
    super()
    this.featureFlagRepository = featureFlagRepository || FeatureFlagRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.CREATED).json(result)
  }

  parseResponseFlag(flag: FeatureFlag) {
    return {
      name: flag.name,
      is_active: flag.isActive,
      description: flag.description,
      metadata: flag.metadata,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const flag = {
      name: validatedData.name,
      isActive: validatedData.is_active,
      description: validatedData.description,
      metadata: validatedData.metadata,
    }

    const newFlag = await this.featureFlagRepository.createFeatureFlag(flag, true)

    return {
      data: {
        flag: this.parseResponseFlag(newFlag),
      },
      message: 'Feature flag created successfully',
    }
  }
}

export { endpoint }
