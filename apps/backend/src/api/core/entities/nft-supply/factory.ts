import { faker } from '@faker-js/faker'

import { NftSupply } from 'api/core/entities/nft-supply/model'

interface NftSupplyFactoryArgs {
  nftSupplyId?: string
  name?: string
  description?: string
  url?: string
  code?: string
  contractAddress?: string
  sessionId?: string
  resource?: string
  totalSupply?: number
  mintedAmount?: number
  issuer?: string
}

export const nftSupplyFactory = ({
  nftSupplyId,
  name,
  description,
  url,
  code,
  contractAddress,
  sessionId,
  resource,
  totalSupply,
}: NftSupplyFactoryArgs): NftSupply => {
  const nft = new NftSupply()
  nft.nftSupplyId = nftSupplyId ?? faker.string.uuid()
  nft.name = name ?? faker.science.chemicalElement().name
  nft.description = description ?? faker.commerce.productDescription()
  nft.url = url ?? faker.image.url()
  nft.code = code ?? faker.science.chemicalElement().symbol
  nft.contractAddress = contractAddress ?? faker.string.alphanumeric({ casing: 'upper', length: 56 })
  nft.sessionId = sessionId ?? faker.string.alphanumeric({ casing: 'lower' })
  nft.resource = resource ?? faker.string.alphanumeric({ casing: 'lower' })
  nft.totalSupply = totalSupply ?? faker.number.int({ min: 10, max: 100 })
  return nft
}
