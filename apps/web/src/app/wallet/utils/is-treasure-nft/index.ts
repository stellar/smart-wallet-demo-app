import { Nft } from '../../domain/models/nft'

export const isTreasureNft = (nft: Nft): boolean => {
  return nft.resource?.includes('treasure') ? true : false
}
