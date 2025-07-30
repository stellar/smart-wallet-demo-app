import { faker } from '@faker-js/faker'

import { Asset } from 'api/core/entities/asset/model'

interface AssetFactoryArgs {
  assetId?: string
  name?: string
  code?: string
  type?: string
  contractAddress?: string
}

export const assetFactory = ({ assetId, name, code, type, contractAddress }: AssetFactoryArgs): Asset => {
  const asset = new Asset()
  asset.assetId = assetId ?? faker.string.uuid()
  asset.name = name ?? 'Token Name'
  asset.code = code ?? 'CODE'
  asset.type = type ?? 'token'
  asset.contractAddress = contractAddress ?? 'FAKE_CONTRACT_ADDRESS'
  return asset
}
