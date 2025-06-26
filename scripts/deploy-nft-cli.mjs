import yargs from 'yargs'
import fs from 'node:fs'
import { hideBin } from 'yargs/helpers'
import {
  deployContract,
  uploadWasm,
  deployNFTImagesToIPFS,
  deployNFTMetadatasToIPFS,
  updateContractMetadataURI,
} from './helpers/index.mjs'
import debug from 'debug'

const log = debug('deploy-cli:main')

const argv = await yargs(hideBin(process.argv))
  .usage(
    `Usage: $0 --contractWasm <path> --pinataGatewayURL <url> --pinataKey <key> --stellarSecretKey <key> --collectionName <name> --collectionSymbol <symbol> --collectionSupply <supply>`
  )
  .option('contractWasm', {
    type: 'string',
    description: 'Path to the contract WASM file',
    demandOption: true,
  })
  .option('pinataGatewayURL', {
    type: 'string',
    description: 'Pinata IPFS gateway URL',
    demandOption: true,
  })
  .option('pinataKey', {
    type: 'string',
    description: 'Pinata API key',
    demandOption: true,
  })
  .option('stellarSecretKey', {
    type: 'string',
    description: 'Keypair secret key for the Stellar account that will deploy the contract and own it',
    demandOption: true,
  })
  .options('collectionName', {
    type: 'string',
    description: 'Name of the NFT collection',
    demandOption: true,
  })
  .options('collectionSymbol', {
    type: 'string',
    description: 'Symbol of the NFT collection',
    demandOption: true,
  })
  .options('collectionSupply', {
    type: 'number',
    description: 'Total supply of the NFT collection',
    demandOption: true,
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Enable verbose logging',
    default: false,
  })
  .option('production', {
    type: 'boolean',
    description: 'Run in production mode',
    default: false,
  })
  .parse()

const rootDir = process.cwd()

const {
  contractWasm,
  pinataGatewayURL,
  pinataKey,
  stellarSecretKey,
  collectionName,
  collectionSupply,
  collectionSymbol,
  verbose,
  production,
} = argv

debug.enable(verbose ? 'deploy-cli:*' : 'deploy-cli:main')

if (production) {
  log('⚠️ Running in production mode ⚠️')
} else {
  log('ℹ️ Running in development mode ℹ️')
}

log('⚠️ Cleaning up previous metadata directory... ⚠️')

if (!fs.existsSync(`${rootDir}/nfts/images`)) {
  log('❌ Images directory does not exist. Create your images under the <rootDir>/nfts/images. ❌')
  process.exit(1)
}

try {
  fs.rmdirSync(`${rootDir}/nfts/metadatas`, { recursive: true, force: true })
  fs.mkdirSync(`${rootDir}/nfts/metadatas`)
} catch (error) {
  fs.mkdirSync(`${rootDir}/nfts/metadatas`)
}

log('✅ Metadata directory cleaned up and recreated successfully ✅')
log('⚠️ Starting deployment process ⚠️')

const response = await uploadWasm(contractWasm, stellarSecretKey, production)
const contractAddress = await deployContract(
  response,
  stellarSecretKey,
  collectionName,
  collectionSymbol,
  '',
  collectionSupply,
  production
)

const { filesCount, url: nftsURL } = await deployNFTImagesToIPFS({
  pinataGatewayURL,
  pinataKey,
})

const { url: metadatasURL } = await deployNFTMetadatasToIPFS({
  bucketURL: nftsURL,
  imagesCount: filesCount,
  contractAddress,
  pinataKey,
  pinataGatewayURL,
})

await updateContractMetadataURI(stellarSecretKey, contractAddress, metadatasURL)

log('✅ Deployment completed successfully ✅')

log(`⛓️ Contract Deployed at: ${contractAddress}`)
log(`🩻 NFT Images Deployed at: ${nftsURL}`)
log(`📄 NFT Metadata Deployed at: ${metadatasURL}`)
