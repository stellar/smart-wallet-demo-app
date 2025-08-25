#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import { runMakeCommand } from '../helpers/run-command.mjs';
import { log, logSuccess, logError } from '../helpers/logs.mjs';
import { authenticate, createAssets, install, uploadImagesFolderToIPFS, uploadMetadataFilesToIPFS } from '../helpers/pinata.mjs';
import { DIRECTORIES } from './config.mjs';

dotenv.config();

const main = async () => {
  const argv = await yargs(hideBin(process.argv))
    .option('network', {
      alias: 'n',
      type: 'string',
      default: process.env.STELLAR_NETWORK,
      description: 'Target network (testnet/mainnet)'
    })
    .option('source-account', {
      alias: 's',
      type: 'string',
      demandOption: true,
      description: 'Source account for deployment',
      default: process.env.STELLAR_SOURCE_ACCOUNT
    })
    .option('name', {
      alias: 'c',
      type: 'string',
      default: process.env.STELLAR_NFT_CONTRACT_NAME,
      description: 'Contract name'
    })
    .option('symbol', {
      alias: 'y',
      type: 'string',
      default: process.env.STELLAR_NFT_CONTRACT_SYMBOL,
      description: 'Contract symbol'
    })
    .option('supply', {
      alias: 'm',
      type: 'number',
      default: process.env.STELLAR_NFT_CONTRACT_MAX_SUPPLY,
      description: 'Maximum token supply'
    })
    .option('contract-uri', {
      alias: 'u',
      type: 'string',
      default: process.env.STELLAR_NFT_CONTRACT_URI,
      description: 'Contract base URI for metadata'
    })
    .option('skip-build', {
      type: 'boolean',
      default: false,
      description: 'Skip contract building'
    })
    .option('skip-upload', {
      type: 'boolean',
      default: false,
      description: 'Skip WASM upload'
    })
    .option('skip-deploy', {
      type: 'boolean',
      default: false,
      description: 'Skip contract deployment'
    })
    .option('skip-ipfs', {
      type: 'boolean',
      default: false,
      description: 'Skip IPFS upload'
    })
    .help()
    .argv;

  log(`Target Network: ${argv.network}`, 'blue');
  log(`Source Account: ${argv.sourceAccount}`, 'blue');
  log(`Contract Name: ${argv.name}`, 'blue');
  log(`Contract Symbol: ${argv.symbol}`, 'blue');
  log(`Max Supply: ${argv.supply}`, 'blue');

  try {
    if (!argv.skipIpfs) {
      if (!install()) {
        logError('failed to install pinata cli');

        process.exit(1);
      }

      if (!authenticate()) {
        logError('failed to authenticate pinata cli');

        process.exit(1);
      }
    }

    if (!argv.skipBuild) {
      runMakeCommand('make build', { cwd: DIRECTORIES.NFT_CONTRACT_DIR });
    }

    if (!argv.skipUpload) {
      runMakeCommand('make upload', { cwd: DIRECTORIES.NFT_CONTRACT_DIR });
    }

    if (!argv.skipDeploy) {
      runMakeCommand('make deploy', { cwd: DIRECTORIES.NFT_CONTRACT_DIR });
    }

    if (!argv.skipIpfs) {
      if (!createAssets()) {
        logError('failed to create images and metadata files');

        process.exit(1);
      }

      const imageUrl = await uploadImagesFolderToIPFS(DIRECTORIES.IMAGES_DIR);

      if (!imageUrl) {
        logError('failed to upload images folder to ipfs');

        process.exit(1);
      }

      // update the base uri in the environment variables to be used in the set-token-metadata script
      process.env.STELLAR_NFT_CONTRACT_BASE_URI = await uploadMetadataFilesToIPFS(imageUrl);

      if (!process.env.STELLAR_NFT_CONTRACT_BASE_URI) {
        logError('failed to upload metadata files to ipfs');

        process.exit(1);
      }
    }

    logSuccess(`deployment completed successfully with metadata uri: ${process.env.STELLAR_NFT_CONTRACT_BASE_URI}`);
  } catch (error) {
    logError(`\n❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
} 
