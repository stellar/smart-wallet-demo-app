import { vendorFactory } from 'api/core/entities/vendor/factory'
import { mockVendorRepository } from 'api/core/services/vendor/mock'

import { CreateVendor, endpoint } from './index'

const mockedVendorRepository = mockVendorRepository()

const mockedPayload = {
  name: 'Vendor Name',
  description: 'Vendor description',
  wallet_address: 'vendor_wallet_address',
  profile_image: 'https://vendor_profile_image.link',
}

const newVendor = vendorFactory({
  name: mockedPayload.name,
  description: mockedPayload.description,
  walletAddress: mockedPayload.wallet_address,
  profileImage: mockedPayload.profile_image,
})

let useCase: CreateVendor

describe('CreateVendor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateVendor(mockedVendorRepository)
  })

  it('should create a vendor', async () => {
    mockedVendorRepository.createVendor.mockResolvedValue(newVendor)
    const result = await useCase.handle(mockedPayload)

    expect(result.data.vendor).toEqual(useCase.parseResponseVendor(newVendor))
    expect(result.message).toBe('Vendor created successfully')
  })

  it('should parse vendor correctly', () => {
    const result = useCase.parseResponseVendor(newVendor)
    expect(result).toEqual({
      id: newVendor.vendorId,
      name: newVendor.name,
      description: newVendor.description,
      is_active: newVendor.isActive,
      display_order: newVendor.displayOrder,
      wallet_address: newVendor.walletAddress,
      profile_image: newVendor.profileImage,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
