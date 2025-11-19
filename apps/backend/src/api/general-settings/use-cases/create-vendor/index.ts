import { Request, Response } from 'express'

import { Vendor, VendorRepositoryType } from 'api/core/entities/vendor/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import VendorRepository from 'api/core/services/vendor'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class CreateVendor extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private vendorRepository: VendorRepositoryType

  constructor(vendorRepository?: VendorRepositoryType) {
    super()
    this.vendorRepository = vendorRepository || VendorRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.CREATED).json(result)
  }

  parseResponseVendor(vendor: Vendor) {
    return {
      id: vendor.vendorId,
      name: vendor.name,
      description: vendor.description,
      is_active: vendor.isActive,
      display_order: vendor.displayOrder,
      wallet_address: vendor.walletAddress,
      profile_image: vendor.profileImage,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const vendor = {
      name: validatedData.name,
      description: validatedData.description,
      isActive: validatedData.is_active,
      displayOrder: validatedData.display_order,
      walletAddress: validatedData.wallet_address,
      profileImage: validatedData.profile_image,
    }

    const newVendor = await this.vendorRepository.createVendor(vendor, true)

    return {
      data: {
        vendor: this.parseResponseVendor(newVendor),
      },
      message: 'Vendor created successfully',
    }
  }
}

export { endpoint }
