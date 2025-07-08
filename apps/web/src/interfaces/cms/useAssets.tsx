import logger from 'src/app/core/services/logger'
import assetsExample from 'src/config/assets.example.json'
import assets from 'src/config/assets.json'

// Eagerly import all assets under /src/assets
const assetModules = import.meta.glob('/src/assets/**/*', { eager: true, import: 'default' })

// Type inference for keys
type AssetKeys = keyof typeof assetsExample

// Normalize local or remote paths
export function resolveAsset(assetPath: string): string {
  if (!assetPath) return ''

  const isRemote = assetPath.startsWith('http://') || assetPath.startsWith('https://')
  if (isRemote) return assetPath

  // Normalize possible missing leading slash
  const normalizedPath = assetPath.startsWith('/') ? assetPath : '/' + assetPath

  // Try to find the matching asset
  const matched = Object.entries(assetModules).find(([key]) => key.endsWith(normalizedPath))

  if (matched) {
    return matched[1] as string
  }

  logger.error(`Asset not found: ${assetPath}`)
  return ''
}

// Hook or direct helper
export function useAssets() {
  return (key: AssetKeys): string => resolveAsset(assets[key])
}

// Static helper for non-hook use
export const a = (key: AssetKeys): string => resolveAsset(assets[key])
