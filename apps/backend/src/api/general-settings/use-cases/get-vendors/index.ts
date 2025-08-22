import { Request, Response } from 'express'

import { Vendor, VendorRepositoryType } from 'api/core/entities/vendor/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import VendorRepository from 'api/core/services/vendor'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetVendors extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private vendorRepository: VendorRepositoryType

  constructor(vendorRepository?: VendorRepositoryType) {
    super()
    this.vendorRepository = vendorRepository || VendorRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponseVendors(vendors: Vendor[]) {
    return vendors.map(vendor => ({
      id: vendor.vendorId,
      name: vendor.name,
      wallet_address: vendor.walletAddress,
      profile_image: vendor.profileImage,
    }))
  }

  async handle() {
    const vendors = await this.vendorRepository.getVendors()

    return {
      data: {
        vendors: this.parseResponseVendors(vendors),
      },
      message: 'Retrieved vendors successfully',
    }
  }
}

export { endpoint }
