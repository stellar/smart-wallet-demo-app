#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from 'pg';
const { Client } = pkg;

const contractAddresses = {
  testnet: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  mainnet: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA'
};

async function seedXlmAsset(network, databaseUrl) {
  const client = new Client({
    connectionString: databaseUrl || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smart_wallet_db'
  });

  try {
    await client.connect();
    console.log('Database connected');

    const contractAddress = contractAddresses[network];
    console.log(`Seeding XLM asset for ${network} network`);
    console.log(`Contract address: ${contractAddress}`);

    // Check if XLM asset already exists
    const existingAsset = await client.query('SELECT asset_id FROM asset WHERE code = $1', ['XLM']);

    if (existingAsset.rows.length > 0) {
      console.log(`✅ XLM asset already exists with ID: ${existingAsset.rows[0].asset_id}`);
      return;
    }

    // Create XLM asset
    const result = await client.query(
      `INSERT INTO asset (name, code, type, contract_address, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING asset_id`,
      ['Stellar', 'XLM', 'native', contractAddress]
    );

    const assetId = result.rows[0].asset_id;
    console.log(`✅ XLM asset created successfully with ID: ${assetId}`);
    console.log(`Network: ${network}`);
    console.log(`Contract Address: ${contractAddress}`);

  } catch (error) {
    console.error('❌ Error seeding XLM asset:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --network <testnet|mainnet> [options]')
    .option('network', {
      alias: 'n',
      type: 'string',
      choices: ['testnet', 'mainnet'],
      default: 'testnet',
      description: 'Network to use (testnet or mainnet)'
    })
    .option('database-url', {
      alias: 'd',
      type: 'string',
      description: 'Database URL for seeding the asset',
      demandOption: false
    })
    .help()
    .argv;

  const { network, databaseUrl } = argv;

  try {
    await seedXlmAsset(network, databaseUrl);
    console.log('✅ XLM asset seeded successfully');
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

main();
