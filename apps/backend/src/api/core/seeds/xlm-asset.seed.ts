import { DataSource } from 'typeorm'

import { Asset } from 'api/core/entities/asset/model'
import { BaseSeed } from 'api/core/framework/orm/base-seed'
import { isMainnet } from 'config/env-utils'
import { logger } from 'config/logger'

const contractAddresses = {
  testnet: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  mainnet: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
}

export class XlmAssetSeed extends BaseSeed {
  name: string = 'XlmAssetSeed'

  async run(dataSource: DataSource): Promise<void> {
    const network = isMainnet() ? 'mainnet' : 'testnet'
    const contractAddress = contractAddresses[network]

    logger.info(`Seeding XLM asset for ${network} network`)
    logger.info(`Contract address: ${contractAddress}`)

    const assetRepository = dataSource.getRepository(Asset)

    // Check if XLM asset already exists
    const existingAsset = await assetRepository.findOne({
      where: { code: 'XLM' },
    })

    if (existingAsset) {
      logger.info(`⏩ XLM asset already exists with ID: ${existingAsset.assetId}`)
      return
    }

    // Create XLM asset
    const newAsset = assetRepository.create({
      name: 'Stellar',
      code: 'XLM',
      type: 'native',
      contractAddress,
    })

    const savedAsset = await assetRepository.save(newAsset)
    logger.info(
      `✅ XLM asset created successfully with ID: ${savedAsset.assetId} | Network: ${network} | Contract Address: ${contractAddress}`
    )
  }
}
