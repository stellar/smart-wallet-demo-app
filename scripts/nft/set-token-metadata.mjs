import { log, logSuccess, logError } from '../helpers/logs.mjs';
import { runMakeCommand } from '../helpers/run-command.mjs';
import { DIRECTORIES } from './config.mjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';

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
      demandOption: false,
      description: 'Source account for deployment',
      default: process.env.STELLAR_SOURCE_ACCOUNT
    })
    .option('contract-id', {
      alias: 'c',
      type: 'string',
      demandOption: false,
      description: 'Contract ID',
      default: process.env.STELLAR_NFT_CONTRACT_ID
    })
    .option('token-id', {
      alias: 't',
      type: 'number',
      demandOption: true,
      description: 'Token ID to set metadata for'
    })
    .option('base-uri', {
      alias: 'b',
      type: 'string',
      demandOption: true,
      description: 'Base URI for metadata. (e.g. https://gold-changing-centipede-63.mypinata.cloud/ipfs/bafybeib4siupqswp54fxahajktzj3o676ja53v75t25dnp35clys7ymnb4/TEST-1.json)',
      default: process.env.STELLAR_NFT_CONTRACT_BASE_URI
    })
    .help()
    .argv;

  log(`Network: ${argv.network}`, 'blue');
  log(`Source Account: ${argv.sourceAccount}`, 'blue');
  log(`Contract ID: ${argv.contractId}`, 'blue');
  log(`Token ID: ${argv.tokenId}`, 'blue');
  log(`Base URI: ${argv.baseUri}`, 'blue');

  try {
    runMakeCommand(
      `make set-metadata-uri TOKEN_ID=${argv.tokenId} BASE_URI=${argv.baseUri}`,
      { cwd: DIRECTORIES.NFT_CONTRACT_DIR }
    );

    logSuccess(`metadata set successfully for token ${argv.tokenId}`);
  } catch (error) {
    logError(`\n❌ Metadata set failed: ${error.message}`);
    process.exit(1);
  }
};

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