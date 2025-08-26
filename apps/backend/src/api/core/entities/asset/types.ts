import { Asset as AssetModel } from 'api/core/entities/asset/model'

export type Asset = AssetModel

export type AssetRepositoryType = {
  getAssets(): Promise<Asset[]>
  getAssetById(assetId: string): Promise<Asset | null>
  getAssetByContractAddress(contractAddress: string): Promise<Asset | null>
  getAssetByType(type: string): Promise<Asset | null>
  getAssetByCode(code: string): Promise<Asset | null>
  getAssetsByCode(codes: string[]): Promise<Asset[]>
  createAsset(
    asset: { name: string; code: string; type: string; contractAddress: string },
    save?: boolean
  ): Promise<Asset>
  updateAsset(assetId: string, data: Partial<Asset>): Promise<Asset>
  saveAsset(asset: Asset): Promise<Asset>
}
