import { vendorFactory } from 'api/core/entities/vendor/factory'
import { Vendor } from 'api/core/entities/vendor/types'
import { mockVendorRepository } from 'api/core/services/vendor/mock'

import { UpdateVendor, endpoint } from './index'

const mockedVendorRepository = mockVendorRepository()

const mockedVendor = vendorFactory({
  name: 'New Vendor',
  walletAddress: 'CHUD78TDGDQGI3GDQ7GWI3G87GDIQGWIGDIGG99',
  profileImage: 'https://example.com/profile.jpg',
})

let useCase: UpdateVendor

describe('UpdateVendor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new UpdateVendor(mockedVendorRepository)
  })

  it('should update a vendor', async () => {
    const updatedVendor = {
      ...mockedVendor,
      name: 'Updated Vendor',
    } as Vendor

    mockedVendorRepository.updateVendor.mockResolvedValue(updatedVendor)
    const result = await useCase.handle({ id: mockedVendor.vendorId, name: 'Updated Vendor' })

    expect(result.data.vendor).toEqual(useCase.parseResponseVendor(updatedVendor))
    expect(result.message).toBe('Vendor updated successfully')
  })

  it('should parse a vendor correctly', () => {
    const result = useCase.parseResponseVendor(mockedVendor)
    expect(result).toEqual({
      name: mockedVendor.name,
      description: mockedVendor.description,
      is_active: mockedVendor.isActive,
      display_order: mockedVendor.displayOrder,
      wallet_address: mockedVendor.walletAddress,
      profile_image: mockedVendor.profileImage,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/:id')
  })
})
