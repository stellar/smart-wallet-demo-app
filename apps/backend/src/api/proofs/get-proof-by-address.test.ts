import { GetProofByAddressUseCase } from './get-proof-by-address'
import { HttpStatusCodes } from '../core/utils/http/status-code'
import { mockProofRepository } from '../core/services/proof/mocks'

const mockedRepository = mockProofRepository()

vi.mock('../core/services/proof', () => ({
  default: vi.fn(() => mockedRepository),
}))

describe('GetProofByAddressUseCase', () => {
  let useCase: GetProofByAddressUseCase
  let mockReq: any // eslint-disable-line @typescript-eslint/no-explicit-any
  let mockRes: any // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    useCase = new GetProofByAddressUseCase()
    mockReq = {
      params: {
        address: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
      },
      requestId: 'test-request-id',
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('handle', () => {
    it('should return proof data when proof exists', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: 'CDQ3NIAICLAN5AO2BF7YWRU4TOID6B46HCBD5BLWIAFGFNU4TZBGAL4L',
        index: 0,
        receiverAmount: '100000000',
        proofs: [
          'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f',
          '7aa34def4e37f3359bdfe5b7eebdc8d18b741b880febcf78e250a4a3f6e3fe74',
        ],
        createdAt: new Date(),
      }

      mockedRepository.findByAddress.mockResolvedValue(mockProofData)

      const result = await useCase.handle(mockReq, mockRes)

      expect(mockedRepository.findByAddress).toHaveBeenCalledWith(
        'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX'
      )

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
      expect(mockRes.json).toHaveBeenCalledWith({
        contractAddress: 'CDQ3NIAICLAN5AO2BF7YWRU4TOID6B46HCBD5BLWIAFGFNU4TZBGAL4L',
        index: 0,
        amount: 100000000,
        proofs: [
          'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f',
          '7aa34def4e37f3359bdfe5b7eebdc8d18b741b880febcf78e250a4a3f6e3fe74',
        ],
      })

      expect(result).toEqual({
        contractAddress: 'CDQ3NIAICLAN5AO2BF7YWRU4TOID6B46HCBD5BLWIAFGFNU4TZBGAL4L',
        index: 0,
        amount: 100000000,
        proofs: [
          'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f',
          '7aa34def4e37f3359bdfe5b7eebdc8d18b741b880febcf78e250a4a3f6e3fe74',
        ],
      })
    })

    it('should return 404 when proof does not exist', async () => {
      mockedRepository.findByAddress.mockResolvedValue(null)

      const result = await useCase.handle(mockReq, mockRes)

      expect(mockedRepository.findByAddress).toHaveBeenCalledWith(
        'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX'
      )

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCodes.NOT_FOUND)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Proof not found for address',
      })

      expect(result).toEqual({
        message: 'Proof not found for address',
      })
    })

    it('should validate invalid address format', async () => {
      mockReq.params.address = 'invalid-address'

      const error = await useCase.handle(mockReq, mockRes).catch(e => e)
      expect(error.name).toBe('ZodValidationException')
      expect(mockedRepository.findByAddress).not.toHaveBeenCalled()
    })

    it('should validate empty address', async () => {
      mockReq.params.address = ''

      const error = await useCase.handle(mockReq, mockRes).catch(e => e)
      expect(error.name).toBe('ZodValidationException')
      expect(mockedRepository.findByAddress).not.toHaveBeenCalled()
    })

    it('should validate address with wrong length', async () => {
      mockReq.params.address = 'SHORT'

      const error = await useCase.handle(mockReq, mockRes).catch(e => e)
      expect(error.name).toBe('ZodValidationException')
      expect(mockedRepository.findByAddress).not.toHaveBeenCalled()
    })

    it('should validate proof hashes are properly formatted', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: 'CDQ3NIAICLAN5AO2BF7YWRU4TOID6B46HCBD5BLWIAFGFNU4TZBGAL4L',
        index: 0,
        receiverAmount: '100000000',
        proofs: [
          'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f',
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          '0000000000000000000000000000000000000000000000000000000000000000',
        ],
        createdAt: new Date(),
      }

      mockedRepository.findByAddress.mockResolvedValue(mockProofData)

      const result = await useCase.handle(mockReq, mockRes)

      expect('proofs' in result && result.proofs).toHaveLength(3)
      expect('proofs' in result && result.proofs[0]).toBe(
        'cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f'
      )
      expect('proofs' in result && result.proofs[1]).toBe(
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )
      expect('proofs' in result && result.proofs[2]).toBe(
        '0000000000000000000000000000000000000000000000000000000000000000'
      )
    })

    it('should validate contract address with StrKey', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: 'CDQ3NIAICLAN5AO2BF7YWRU4TOID6B46HCBD5BLWIAFGFNU4TZBGAL4L',
        index: 0,
        receiverAmount: '100000000',
        proofs: ['cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f'],
        createdAt: new Date(),
      }

      mockedRepository.findByAddress.mockResolvedValue(mockProofData)

      const result = await useCase.handle(mockReq, mockRes)

      expect('contractAddress' in result && result.contractAddress).toBe(
        'CDQ3NIAICLAN5AO2BF7YWRU4TOID6B46HCBD5BLWIAFGFNU4TZBGAL4L'
      )
    })

    it('should validate invalid contract address from database', async () => {
      const mockProofData = {
        receiverAddress: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        contractAddress: 'INVALID-CONTRACT-ADDRESS',
        index: 0,
        receiverAmount: '100000000',
        proofs: ['cd9bbfb141e8c63b620238d79aabfbe5eaf16309874b3f32fc443b4f477c9b2f'],
        createdAt: new Date(),
      }

      mockedRepository.findByAddress.mockResolvedValue(mockProofData)

      const error = await useCase.handle(mockReq, mockRes).catch(e => e)
      expect(error.name).toBe('ZodValidationException')
      expect(mockedRepository.findByAddress).toHaveBeenCalledWith(
        'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX'
      )
    })
  })
})
