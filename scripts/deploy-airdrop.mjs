import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateProofsFromFile } from './generate-proofs.mjs';
import { uploadProofsToDB } from './upload-proofs-to-db.mjs';

const execAsync = promisify(exec);

const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --addresses <file> --amount <number> --token <address> --network <testnet|mainnet> --source <identity> [options]')
    .option('addresses', {
        type: 'string',
        description: 'Path to file containing recipient addresses (one per line)',
        demandOption: true
    })
    .option('amount', {
        type: 'number',
        description: 'Amount to distribute to each recipient',
        demandOption: true
    })
    .option('token', {
        type: 'string',
        description: 'Token contract address',
        demandOption: true
    })
    .option('network', {
        type: 'string',
        choices: ['testnet', 'mainnet'],
        description: 'Stellar network to deploy to',
        demandOption: true
    })
    .option('rpc-url', {
        type: 'string',
        description: 'RPC URL for the network',
        demandOption: true
    })
    .option('source', {
        type: 'string',
        description: 'Stellar identity/account to deploy from',
        demandOption: true
    })
    .option('database-url', {
        type: 'string',
        description: 'Database URL for uploading proofs',
        demandOption: true
    })
    .help()
    .argv;

const {
    addresses: addressesPath,
    amount,
    token: tokenAddress,
    network,
    'rpc-url': rpcUrl,
    source,
    'database-url': databaseUrl
} = argv;

const networkPassphrase = network === 'mainnet' 
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015';


async function deployContract(rootHash, totalAmount) {
    console.log('Deploying airdrop contract...');
    
    const wasmPath = 'wasms/airdrop.optimized.wasm';
    const deployCmd = [
        'stellar contract deploy',
        `--wasm ${wasmPath}`,
        `--network ${network}`,
        `--network-passphrase "${networkPassphrase}"`,
        `--rpc-url ${rpcUrl}`,
        `--source ${source}`,
        '--',
        `--root_hash ${rootHash}`,
        `--token ${tokenAddress}`,
        `--funding_amount ${totalAmount}`,
        `--funding_source ${source}`
    ].filter(Boolean).join(' ');
    
    
    const { stdout, stderr } = await execAsync(deployCmd, {
        cwd: '..'
    });
    
    if (stderr && stderr.includes('error:') && !stderr.includes('✅ Deployed!')) {
        throw new Error(`Deployment failed: ${stderr}`);
    }
    
    // Extract contract address from output (stellar CLI outputs to stderr)
    const output = stdout + stderr;
    const contractAddressMatch = output.match(/([C][A-Z0-9]{55})/);
    if (!contractAddressMatch) {
        throw new Error('Could not extract contract address from deployment output');
    }
    
    const contractAddress = contractAddressMatch[0];
    console.log(`✅ Contract deployed: ${contractAddress}`);
    
    return contractAddress;
}

async function main() {
    try {
        console.log('Starting airdrop deployment process');
        console.log(`Recipients file: ${addressesPath}`);
        console.log(`Amount per recipient: ${amount}`);
        console.log(`Token address: ${tokenAddress}`);
        console.log(`Network: ${network}`);
        console.log(`Network passphrase: ${networkPassphrase}`);
        console.log(`RPC URL: ${rpcUrl}`);
        console.log(`Source account: ${source}`);
        console.log(`Funding account: ${source}`);
        console.log('');
        
        
        // Step 1: Generate proofs
        console.log('Generating Merkle proofs...');
        const proofsResult = generateProofsFromFile(addressesPath, amount);
        const totalAmount = proofsResult.proofs.length * amount;
        
        console.log(`Summary:`);
        console.log(`  Recipients: ${proofsResult.proofs.length}`);
        console.log(`  Total amount needed: ${totalAmount}`);
        console.log(`  Merkle root: ${proofsResult.root}`);
        console.log('');
        
        // Step 2: Deploy contract
        const contractAddress = await deployContract(proofsResult.root, totalAmount);
        
        // Step 3: Upload proofs to database
        console.log('Uploading proofs to database...');
        const uploadedCount = await uploadProofsToDB(
            proofsResult.proofs, 
            contractAddress, 
            databaseUrl
        );
        console.log(`✅ Uploaded ${uploadedCount} proofs to database`);
        
        console.log('');
        console.log('✅ Airdrop deployment completed successfully!');
        console.log('');
        console.log('Deployment Summary:');
        console.log(`  Contract Address: ${contractAddress}`);
        console.log(`  Network: ${network}`);
        console.log(`  Token: ${tokenAddress}`);
        console.log(`  Recipients: ${proofsResult.proofs.length}`);
        console.log(`  Amount per recipient: ${amount}`);
        console.log(`  Total amount: ${totalAmount}`);
        console.log(`  Merkle root: ${proofsResult.root}`);
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main();