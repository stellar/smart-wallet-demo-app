import { ngoFactory } from 'api/core/entities/ngo/factory'
import { mockNgoRepository } from 'api/core/services/ngo/mock'

import { CreateNgo, endpoint } from './index'

const mockedNgoRepository = mockNgoRepository()

const mockedPayload = {
  name: 'NGO Name',
  description: 'NGO Description',
  wallet_address: 'ngo_wallet_address',
  profile_image: 'https://ngo_profile_image.link',
}

const newNgo = ngoFactory({
  name: mockedPayload.name,
  description: mockedPayload.description,
  walletAddress: mockedPayload.wallet_address,
  profileImage: mockedPayload.profile_image,
})

let useCase: CreateNgo

describe('CreateNgo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateNgo(mockedNgoRepository)
  })

  it('should create a ngo', async () => {
    mockedNgoRepository.createNgo.mockResolvedValue(newNgo)
    const result = await useCase.handle(mockedPayload)

    expect(result.data.ngo).toEqual(useCase.parseResponse(newNgo))
    expect(result.message).toBe('NGO created successfully')
  })

  it('should parse ngo correctly', () => {
    const result = useCase.parseResponse(newNgo)
    expect(result).toEqual({
      id: newNgo.ngoId,
      name: newNgo.name,
      description: newNgo.description,
      wallet_address: newNgo.walletAddress,
      profile_image: newNgo.profileImage,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
