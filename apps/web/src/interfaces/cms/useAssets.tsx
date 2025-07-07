import logger from 'src/app/core/services/logger'
import assetsExample from 'src/config/assets.example.json'
import assets from 'src/config/assets.json'

// Type inference for keys
type AssetKeys = keyof typeof assetsExample

// Normalize local or remote paths
export function resolveAsset(assetPath: string): string {
  if (!assetPath) return ''

  const isRemote = assetPath.startsWith('http://') || assetPath.startsWith('https://')
  if (isRemote) return assetPath

  try {
    return assetPath
  } catch {
    logger.error(`Asset not found or could not resolve: ${assetPath}`)
    return ''
  }
}

// Hook or direct helper
export function useAssets() {
  return (key: AssetKeys): string => resolveAsset(assets[key])
}

// Static helper for non-hook use
export const a = (key: AssetKeys): string => resolveAsset(assets[key])
