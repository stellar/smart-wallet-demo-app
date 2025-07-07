import { Router } from 'express'
import { GetProofByAddressUseCase } from './get-proof-by-address'

const router = Router()

router.get('/:address', async (req, res, next) => {
  try {
    const useCase = new GetProofByAddressUseCase()
    await useCase.handle(req, res)
  } catch (error) {
    next(error)
  }
})

export default router
