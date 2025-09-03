import { ngoFactory } from 'api/core/entities/ngo/factory'
import { mockNgoRepository } from 'api/core/services/ngo/mock'

import { GetNgos, endpoint } from './index'

const mockedNgoRepository = mockNgoRepository()

const ngo1 = ngoFactory({})
const ngo2 = ngoFactory({})

let useCase: GetNgos

describe('GetNgos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetNgos(mockedNgoRepository)
  })

  it('should return ngos', async () => {
    mockedNgoRepository.getNgos.mockResolvedValue([ngo1, ngo2])
    const result = await useCase.handle()

    expect(result.data.ngos).toEqual(useCase.parseResponse([ngo1, ngo2]))
    expect(result.message).toBe('Retrieved NGOs successfully')
  })

  it('should return ngos - empty case', async () => {
    mockedNgoRepository.getNgos.mockResolvedValue([])
    const result = await useCase.handle()

    expect(result.data.ngos).toEqual([])
    expect(result.message).toBe('Retrieved NGOs successfully')
  })

  it('should parse ngos correctly', async () => {
    const parsedNgos = useCase.parseResponse([ngo1, ngo2])

    expect(parsedNgos).toEqual([
      {
        id: ngo1.ngoId,
        name: ngo1.name,
        description: ngo1.description,
        wallet_address: ngo1.walletAddress,
        profile_image: ngo1.profileImage,
      },
      {
        id: ngo2.ngoId,
        name: ngo2.name,
        description: ngo2.description,
        wallet_address: ngo2.walletAddress,
        profile_image: ngo2.profileImage,
      },
    ])
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
