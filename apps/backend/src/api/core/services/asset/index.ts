import { Asset as AssetModel } from 'api/core/entities/asset/model'
import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class AssetRepository extends SingletonBase implements AssetRepositoryType {
  constructor() {
    super()
  }

  async getAssetById(assetId: string): Promise<Asset | null> {
    return AssetModel.findOneBy({ assetId })
  }

  async getAssetByContractAddress(contractAddress: string): Promise<Asset | null> {
    return AssetModel.findOneBy({ contractAddress })
  }

  async getAssetByType(type: string): Promise<Asset | null> {
    return AssetModel.findOneBy({ type })
  }

  async getAssetByCode(code: string): Promise<Asset | null> {
    return AssetModel.findOneBy({ code })
  }

  async createAsset(
    asset: { name: string; code: string; type: string; contractAddress: string },
    save?: boolean
  ): Promise<Asset> {
    const newAsset = AssetModel.create({ ...asset })
    if (save) {
      return this.saveAsset(newAsset)
    }
    return newAsset
  }

  async updateAsset(assetId: string, data: Partial<Asset>): Promise<Asset> {
    await AssetModel.update(assetId, data)
    return this.getAssetById(assetId) as Promise<Asset>
  }

  saveAsset(asset: Asset): Promise<Asset> {
    return AssetModel.save(asset)
  }
}
