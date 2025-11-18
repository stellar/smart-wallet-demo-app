import { vendorFactory } from 'api/core/entities/vendor/factory'
import { mockVendorRepository } from 'api/core/services/vendor/mock'

import { GetVendors, endpoint } from './index'

const mockedVendorRepository = mockVendorRepository()

const vendor1 = vendorFactory({})
const vendor2 = vendorFactory({})

let useCase: GetVendors

describe('GetVendors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetVendors(mockedVendorRepository)
  })

  it('should return vendors', async () => {
    mockedVendorRepository.getVendors.mockResolvedValue([vendor1, vendor2])
    const result = await useCase.handle()

    expect(result.data.vendors).toEqual(useCase.parseResponseVendors([vendor1, vendor2]))
    expect(result.message).toBe('Retrieved vendors successfully')
  })

  it('should return vendors - empty case', async () => {
    mockedVendorRepository.getVendors.mockResolvedValue([])
    const result = await useCase.handle()

    expect(result.data.vendors).toEqual([])
    expect(result.message).toBe('Retrieved vendors successfully')
  })

  it('should parse vendors correctly', async () => {
    const parsedVendors = useCase.parseResponseVendors([vendor1, vendor2])

    expect(parsedVendors).toEqual([
      {
        id: vendor1.vendorId,
        name: vendor1.name,
        description: vendor1.description,
        is_active: vendor1.isActive,
        display_order: vendor1.displayOrder,
        wallet_address: vendor1.walletAddress,
        profile_image: vendor1.profileImage,
      },
      {
        id: vendor2.vendorId,
        name: vendor2.name,
        description: vendor2.description,
        is_active: vendor2.isActive,
        display_order: vendor2.displayOrder,
        wallet_address: vendor2.walletAddress,
        profile_image: vendor2.profileImage,
      },
    ])
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
