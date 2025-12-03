import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates metadata JSON structure matching the parseResponse format
 */
function createMetadata(tokenId, nftSupply) {
  return {
    name: `${nftSupply.name} #${tokenId}`.trim(),
    description: `${nftSupply.description} #${tokenId}`.trim(),
    image: nftSupply.url,
    external_url: nftSupply.url,
    attributes: [
      {
        trait_type: 'Token ID',
        value: tokenId,
      },
      {
        trait_type: 'Collection',
        value: nftSupply.name,
      },
      {
        trait_type: 'Session',
        value: nftSupply.sessionId,
      },
      {
        trait_type: 'Resource',
        value: nftSupply.resource,
      },
    ],
  };
}

/**
 * Pulls NFT metadata from database and generates JSON files
 */
async function pullNftMetadata(databaseUrl, outputDir = null) {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Required for AWS RDS and other managed databases
    }
  });

  // Set default output directory if not provided
  const baseOutputDir = outputDir || path.resolve(__dirname, './nft-metadata');

  try {
    await client.connect();
    console.log('✅ Database connected');

    // Query all NFTs with their related NftSupply data
    const query = `
      SELECT
        n.token_id,
        n.contract_address,
        ns.contract_address as nft_supply_contract_address,
        ns.name,
        ns.description,
        ns.url,
        ns.session_id,
        ns.resource
      FROM nft n
      INNER JOIN nft_supply ns ON n.nft_supply_id = ns.nft_supply_id
      ORDER BY COALESCE(ns.contract_address, n.contract_address), n.token_id
    `;

    const result = await client.query(query);
    const nfts = result.rows;

    if (nfts.length === 0) {
      console.log('⚠️  No NFTs found in the database');
      return;
    }

    // Group NFTs by contract address
    const nftsByContract = {};
    for (const nft of nfts) {
      const contractAddress = nft.nft_supply_contract_address || nft.contract_address;
      if (!nftsByContract[contractAddress]) {
        nftsByContract[contractAddress] = [];
      }
      nftsByContract[contractAddress].push(nft);
    }

    console.log(`📦 Found ${nfts.length} NFTs across ${Object.keys(nftsByContract).length} contract(s)`);

    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    const contractStats = {};

    // Process each contract
    for (const [contractAddress, contractNfts] of Object.entries(nftsByContract)) {
      console.log(`\n📄 Processing contract: ${contractAddress} (${contractNfts.length} NFTs)`);

      // Create contract-specific directory
      const contractDir = path.join(baseOutputDir, contractAddress);

      // Create output directory for this contract
      if (!fs.existsSync(contractDir)) {
        fs.mkdirSync(contractDir, { recursive: true });
      }

      let contractSuccessCount = 0;
      let contractErrorCount = 0;

      // Process each NFT in this contract
      for (let i = 0; i < contractNfts.length; i++) {
        const nft = contractNfts[i];
        const tokenId = nft.token_id;

        // Show progress every 100 NFTs or on last NFT
        if ((i + 1) % 100 === 0 || i === contractNfts.length - 1) {
          process.stdout.write(`\r   Processing: ${i + 1}/${contractNfts.length} NFTs`);
        }

        try {
          // Create metadata object
          const metadata = createMetadata(tokenId, {
            name: nft.name,
            description: nft.description,
            url: nft.url,
            sessionId: nft.session_id,
            resource: nft.resource,
          });

          // Save metadata JSON file
          const metadataPath = path.join(contractDir, tokenId);
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

          contractSuccessCount++;
        } catch (error) {
          console.error(`\n❌ Error processing token ${tokenId}: ${error.message}`);
          contractErrorCount++;
        }
      }

      // Clear progress line and show completion
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
      console.log(`   ✅ Completed: ${contractSuccessCount}/${contractNfts.length} NFTs${contractErrorCount > 0 ? ` (${contractErrorCount} errors)` : ''}`);

      contractStats[contractAddress] = {
        success: contractSuccessCount,
        errors: contractErrorCount,
        total: contractNfts.length,
        contractDir,
      };

      totalSuccessCount += contractSuccessCount;
      totalErrorCount += contractErrorCount;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully processed: ${totalSuccessCount} NFTs`);
    if (totalErrorCount > 0) {
      console.log(`   ❌ Errors: ${totalErrorCount} NFTs`);
    }
    console.log(`\n📋 Contracts processed: ${Object.keys(contractStats).length}`);
    for (const [contractAddress, stats] of Object.entries(contractStats)) {
      const status = stats.errors > 0 ? ` (${stats.errors} errors)` : '';
      console.log(`   📄 ${contractAddress}: ${stats.success}/${stats.total} NFTs${status}`);
    }

  } catch (error) {
    console.error('❌ Error pulling NFT metadata from database:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --database-url <url> [--output-dir <path>]')
    .option('database-url', {
      type: 'string',
      description: 'Database connection URL (e.g., postgresql://user:pass@host:port/dbname)',
      demandOption: true,
    })
    .option('output-dir', {
      type: 'string',
      description: 'Output directory for metadata JSON files (default: ./nft-metadata)',
      demandOption: false,
    })
    .argv;

  const {
    'database-url': databaseUrl,
    'output-dir': outputDir
  } = argv;

  try {
    await pullNftMetadata(databaseUrl, outputDir);
    console.log('\n✅ NFT metadata pulled from database successfully');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Only run main if this file is being executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { pullNftMetadata };

