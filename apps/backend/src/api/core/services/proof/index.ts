import { AppDataSource } from 'config/database'
import { Proof } from '../../entities/proof/model'
import { ProofRepositoryType } from '../../entities/proof/types'
import { logger } from '../../../../config/logger'
import { Repository } from 'typeorm'

export default class ProofRepository implements ProofRepositoryType {
  private repository: Repository<Proof> = AppDataSource.getRepository(Proof)

  async findByAddress(receiverAddress: string): Promise<Proof | null> {
    logger.debug({ receiverAddress }, 'Querying database for proof')

    try {
      const proof = await this.repository.findOne({
        where: {
          receiverAddress,
        },
      })

      if (!proof) {
        logger.debug({ receiverAddress }, 'No proof found in database')
        return null
      }

      logger.debug(
        {
          receiverAddress,
          index: proof.index,
          contractAddress: proof.contractAddress,
        },
        'Proof found in database'
      )

      return proof
    } catch (error) {
      logger.error({ receiverAddress, error }, 'Database error when querying for proof')
      throw error
    }
  }
}
