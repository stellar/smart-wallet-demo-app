import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import { deployFolderToPinataIPFS } from './index.mjs'
import debug from 'debug'

const log = debug('deploy-cli:ipfs-metadatas')

/**
 * Creates metadata files for NFTs and writes them to the filesystem.
 *
 * @param {string} bucketURL - The base URL for the NFT images
 * @param {number} imagesCount - The number of images for which to create metadata.
 * @param {string} contractAddress - The address of the contract that owns the NFTs.
 * @param {string} collectionName - Name of the NFT Collection
 * @param {string} collectionDescription - Description of the NFT Collection
 * @param {string} collectionSymbol - Code of the NFT Collection
 *
 * This function generates metadata for each NFT based on the baseMetadata
 * template and writes the information to JSON files in the nfts/metadatas directory.
 * Each metadata includes a name, description, URL, and other properties.
 */
async function createMetadatas(
  bucketURL,
  imagesCount,
  contractAddress,
  collectionName,
  collectionDescription,
  collectionSymbol
) {
  const rootDir = process.cwd()

  await Promise.all(
    Array.from({ length: imagesCount }).map(async (_, index) => {
      const metadata = {
        name: `${collectionName} #${index}`,
        code: collectionSymbol,
        description: `${collectionDescription} #${index + 1} collectible`,
        url: `${bucketURL}/${index}.png`,
        issuer: contractAddress,
      }

      await fs.writeFile(`${rootDir}/nfts/metadatas/${index}.json`, JSON.stringify(metadata), 'utf-8')

      return metadata
    })
  )
}

/**
 * Deploys NFT metadata files to IPFS.
 *
 * @param {Object} config - The configuration object.
 * @param {string} config.bucketURL - The base URL for the NFT images.
 * @param {number} config.imagesCount - The number of images for which to create metadata.
 * @param {string} config.contractAddress - The address of the contract that owns the NFTs.
 * @param {string} config.pinataKey - The Pinata API key for authentication.
 * @param {string} config.pinataGatewayURL - The Pinata gateway URL for IPFS access.
 * @param {string} config.collectionName -  Name of the NFT Collection
 * @param {string} config.collectionDescription - Description of the NFT Collection
 * @param {string} config.collectionSymbol - Code of the NFT Collection
 * @returns {Promise<{url: string, cid: string, filesCount: number}>} Resolves with the CID of the deployed metadata folder.
 *
 * This function first generates metadata for NFTs and writes them to the filesystem.
 * It then deploys the metadata folder to Pinata IPFS and returns the folder's CID.
 */

export async function deployNFTMetadatasToIPFS({
  bucketURL,
  imagesCount,
  contractAddress,
  pinataKey,
  pinataGatewayURL,
  collectionName,
  collectionSymbol,
  collectionDescription,
}) {
  await createMetadatas(
    bucketURL,
    imagesCount,
    contractAddress,
    collectionName,
    collectionSymbol,
    collectionDescription
  )

  const rootDir = process.cwd()

  log('⚠️ Deploying NFT metadatas to IPFS... ⚠️')

  const metadatasDir = `${rootDir}/nfts/metadatas`

  if (!fsSync.existsSync(metadatasDir)) {
    log(`🚨 Metadatas directory does not exist: ${metadatasDir} 🚨`)
    process.exit(1)
  }

  log(`⚠️ Deploying metadatas directory ⚠️`)

  return await deployFolderToPinataIPFS({
    apiKey: pinataKey,
    gatewayURL: pinataGatewayURL,
    folderPath: metadatasDir,
    folderName: 'metadatas',
  })
}
