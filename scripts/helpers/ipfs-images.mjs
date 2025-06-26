import fs from 'node:fs'
import debug from 'debug'
import { deployFolderToPinataIPFS } from './ipfs-helpers.mjs'

const log = debug('deploy-cli:ipfs-images')

/**
 * Deploys NFT images to IPFS.
 *
 * @param {{ pinataKey: string, pinataGatewayURL: string }} config - The configuration object.
 *  @param {string} config.pinataKey - The Pinata API key.
 *  @param {string} config.pinataGatewayURL - The Pinata gateway URL.
 * @returns {Promise<{url: string, cid: string, filesCount: number}>} Resolves with the CID of the deployed folder.
 */
export async function deployNFTImagesToIPFS({ pinataKey, pinataGatewayURL }) {
  const rootDir = process.cwd()

  log('⚠️ Deploying NFT images to IPFS... ⚠️')

  const imagesDir = `${rootDir}/nfts/images`

  if (!fs.existsSync(imagesDir)) {
    log(`🚨 Images directory does not exist: ${imagesDir} 🚨`)
    process.exit(1)
  }

  log(`⚠️ Deploying images directory ⚠️`)

  return await deployFolderToPinataIPFS({
    apiKey: pinataKey,
    gatewayURL: pinataGatewayURL,
    folderPath: imagesDir,
    folderName: 'images',
  })
}
