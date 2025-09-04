import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateProofsFromFile } from './generate-proofs.mjs';
import { uploadProofsToDB } from './upload-proofs-to-db.mjs';

const execAsync = promisify(exec);

function formatAmount(stroops) {
    const xlm = stroops / 10000000; // 1 XLM = 10^7 stroops
    if (xlm >= 1) {
        return `${xlm.toLocaleString()}`;
    } else {
        return `${stroops.toLocaleString()} stroops`;
    }
}

const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --addresses <file> --amount <number> --token <address> --network <testnet|mainnet> --source <identity> --funder <identity> [options]')
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
    .option('source', {
        type: 'string',
        description: 'Stellar identity/account to deploy from (admin)',
        demandOption: true
    })
    .option('funder', {
        type: 'string',
        description: 'Stellar identity/account that will fund the contract',
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
    source,
    funder,
    'database-url': databaseUrl
} = argv;


async function deployContract(rootHash) {
    console.log('Deploying airdrop contract...');
    
    const { stdout: adminAddress } = await execAsync(`stellar keys address ${source}`);
    const adminAddr = adminAddress.trim();
    const { stdout: funderAddress } = await execAsync(`stellar keys address ${funder}`);
    const funderAddr = funderAddress.trim();
    
    const wasmPath = 'wasms/airdrop.optimized.wasm';
    const deployCmd = [
        'stellar contract deploy',
        `--wasm ${wasmPath}`,
        `--network ${network}`,
        `--source ${source}`,
        '--',
        `--root_hash ${rootHash}`,
        `--token ${tokenAddress}`,
        `--admin ${adminAddr}`,
        `--funder ${funderAddr}`
    ].join(' ');
    
    
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
        const { stdout: sourceAddress } = await execAsync(`stellar keys address ${source}`);
        const sourceAddr = sourceAddress.trim();
        const { stdout: funderAddress } = await execAsync(`stellar keys address ${funder}`);
        const funderAddr = funderAddress.trim();
        
        console.log('Starting airdrop deployment process');
        console.log(`Recipients file: ${addressesPath}`);
        console.log(`Amount per recipient: ${formatAmount(amount)}`);
        console.log(`Token address: ${tokenAddress}`);
        console.log(`Network: ${network}`);
        console.log(`Admin account: ${source} (${sourceAddr})`);
        console.log(`Funder account: ${funder} (${funderAddr})`);
        console.log('');
        
        
        // Step 1: Generate proofs
        console.log('Generating Merkle proofs...');
        const proofsResult = generateProofsFromFile(addressesPath, amount);
        const totalAmount = proofsResult.proofs.length * amount;
        
        console.log(`Summary:`);
        console.log(`  Recipients: ${proofsResult.proofs.length}`);
        console.log(`  Total amount needed: ${formatAmount(totalAmount)} (${totalAmount.toLocaleString()} stroops)`);
        console.log(`  Merkle root: ${proofsResult.root}`);
        console.log('');
        
        console.log(`⚠️ After deployment, you must transfer ${formatAmount(totalAmount)} to the contract address`);
        console.log('');
        
        // Step 2: Deploy contract
        const contractAddress = await deployContract(proofsResult.root);
        
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
        console.log(`  Amount per recipient: ${formatAmount(amount)}`);
        console.log(`  Total amount: ${formatAmount(totalAmount)} (${totalAmount.toLocaleString()} stroops)`);
        console.log(`  Admin: ${source} (${sourceAddr})`);
        console.log(`  Funder: ${funder} (${funderAddr})`);
        console.log(`  Merkle root: ${proofsResult.root}`);
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main();