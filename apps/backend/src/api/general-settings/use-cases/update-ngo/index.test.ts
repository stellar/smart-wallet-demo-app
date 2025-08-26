import { ngoFactory } from 'api/core/entities/ngo/factory'
import { Ngo } from 'api/core/entities/ngo/types'
import { mockNgoRepository } from 'api/core/services/ngo/mock'

import { UpdateNgo, endpoint } from './index'

const mockedNgoRepository = mockNgoRepository()

const mockedNgo = ngoFactory({
  name: 'New NGO',
  description: 'New NGO description',
  walletAddress: 'CHUD78TDGDQGI3GDQ7GWI3G87GDIQGWIGDIGG99',
  profileImage: 'https://example.com/profile.jpg',
})

let useCase: UpdateNgo

describe('UpdateNgo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new UpdateNgo(mockedNgoRepository)
  })

  it('should update a ngo', async () => {
    const updatedNgo = {
      ...mockedNgo,
      name: 'Updated NGO',
      description: 'Updated NGO description',
    } as Ngo

    mockedNgoRepository.updateNgo.mockResolvedValue(updatedNgo)
    const result = await useCase.handle({
      id: mockedNgo.ngoId,
      name: 'Updated NGO',
      description: 'Updated NGO description',
    })

    expect(result.data.ngo).toEqual(useCase.parseResponse(updatedNgo))
    expect(result.message).toBe('NGO updated successfully')
  })

  it('should parse a ngo correctly', () => {
    const result = useCase.parseResponse(mockedNgo)
    expect(result).toEqual({
      id: mockedNgo.ngoId,
      name: mockedNgo.name,
      description: mockedNgo.description,
      wallet_address: mockedNgo.walletAddress,
      profile_image: mockedNgo.profileImage,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/:id')
  })
})
