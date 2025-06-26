import { PinataSDK } from 'pinata'
import path from 'node:path'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import debug from 'debug'

const log = debug('deploy-cli:ipfs-helpers')

/**
 * Constructs the URL for the folder on Pinata IPFS.
 * @param {string} gateway - The URL of the Pinata IPFS gateway.
 * @param {string} cid - The CID of the folder on IPFS.
 * @returns {string} A URL that can be used to access the folder on Pinata IPFS.
 */
function buildFolderURL(gateway, cid) {
  // Constructs the URL for the folder on Pinata IPFS
  return `https://${gateway}/ipfs/${cid}`
}

/**
 * Collects all files in a directory, recursively.
 * @param {string} dir - The directory to search in.
 * @param {string} [base=dir] - The base directory to use for relative paths.
 * @returns {Promise<Array<File>>} - An array of File objects.
 */
async function collectFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }) // :contentReference[oaicite:5]{index=5}

  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const buffer = await fs.readFile(fullPath) // :contentReference[oaicite:7]{index=7}
    const relativeName = path.relative(base, fullPath)
    // Use the Web File API available in Node.js v18+
    const file = new File([buffer], relativeName) // :contentReference[oaicite:8]{index=8}
    files.push(file)
  }
  return files
}

/**
 * Deploys a folder to Pinata IPFS.
 *
 * @param {Object} config - The configuration object.
 *  @param {string} config.folderPath - The path to the folder to deploy.
 *  @param {string} config.folderName - The name of the folder on IPFS.
 *  @param {Record<string, string>} config.folderMetadata - Additional metadata for the folder.
 *  @param {string} config.apiKey - The Pinata API key.
 *  @param {string} config.gatewayURL - The Pinata gateway URL.
 * @returns {Promise<{url: string, cid: string, filesCount: number}>} Resolves with the CID of the deployed folder.
 */
export async function deployFolderToPinataIPFS({ apiKey, gatewayURL, folderPath, folderName, folderMetadata = {} }) {
  const pinata = new PinataSDK({
    pinataJwt: apiKey,
    pinataGateway: gatewayURL,
  })

  if (!folderPath) {
    log('🚨 Folder path is required. 🚨')
    process.exit(1)
  }

  if (!fsSync.existsSync(folderPath)) {
    log(`🚨 Folder does not exist: ${folderPath} 🚨`)
    process.exit(1)
  }

  const files = await collectFiles(folderPath)

  log(`⚠️ Deploying (${files.length} files) to folder: ${folderName} ⚠️`)

  const uploader = await pinata.upload.public.fileArray(files).name(folderName).keyvalues(folderMetadata)

  log(`✅ Folder deployed successfully with CID: ${uploader.cid} ✅`)

  return {
    url: buildFolderURL(gatewayURL, uploader.cid),
    cid: uploader.cid,
    filesCount: uploader.number_of_files,
  }
}
