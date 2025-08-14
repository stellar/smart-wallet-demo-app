import { Repository } from 'typeorm'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { AppDataSource } from 'config/database'

import { logger } from '../../../../config/logger'
import { Proof } from '../../entities/proof/model'
import { ProofRepositoryType } from '../../entities/proof/types'

export default class ProofRepository extends SingletonBase implements ProofRepositoryType {
  private repository: Repository<Proof> = AppDataSource.getRepository(Proof)

  constructor() {
    super()
  }

  async findByAddressAndContract(receiverAddress: string, contractAddress: string): Promise<Proof | null> {
    logger.debug({ receiverAddress, contractAddress }, 'Querying database for proof by address and contract')

    try {
      const proof = await this.repository.findOne({
        where: {
          receiverAddress,
          contractAddress,
        },
      })

      if (!proof) {
        logger.debug({ receiverAddress, contractAddress }, 'No proof found in database')
        return null
      }

      logger.debug(
        {
          receiverAddress,
          contractAddress,
          index: proof.index,
        },
        'Proof found in database'
      )

      return proof
    } catch (error) {
      logger.error({ receiverAddress, contractAddress, error }, 'Database error when querying for proof')
      throw error
    }
  }

  async saveProofs(proofs: Proof[]): Promise<Proof[]> {
    return this.repository.save(proofs)
  }
}
