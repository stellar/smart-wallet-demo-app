import yargs from 'yargs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hideBin } from 'yargs/helpers'
import { generateMerkleProofs } from './helpers/merkle.mjs';

export function generateProofsFromFile(addressesPath, amount) {
    if (!fs.existsSync(addressesPath)) {
        throw new Error(`Addresses file not found: ${addressesPath}`);
    }

    const addressesData = fs.readFileSync(addressesPath, 'utf8');
    const addresses = addressesData.trim().split('\n').filter(line => line.trim()).map(line => line.trim());

    return generateProofsFromAddresses(addresses, amount);
}

export function generateProofsFromAddresses(addresses, amount) {
    if (amount <= 0) {
        throw new Error(`Invalid amount: ${amount}`);
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
        throw new Error('Addresses must be a non-empty array');
    }

    const receivers = addresses.map(address => ({
        address: address.trim(),
        amount
    }));

    for (let i = 0; i < receivers.length; i++) {
        const receiver = receivers[i];
        if (!receiver.address || typeof receiver.address !== 'string') {
            throw new Error(`Invalid address at index ${i}: ${receiver.address}`);
        }
    }

    const result = generateMerkleProofs(receivers);
    console.log(`✅ Merkle proofs generated with root: ${result.root}`);
    console.log(`Generated proofs for ${receivers.length} addresses (amount: ${amount})`);
    
    return result;
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .usage('Usage: $0 --addresses <path> --proofs <path> --amount <number>')
        .option('addresses', {
            type: 'string',
            description: 'Path to file containing list of contract addresses (one per line)',
            demandOption: true
        })
        .option('proofs', {
            type: 'string',
            description: 'Path to the output JSON file for the proofs',
            demandOption: true
        })
        .option('amount', {
            type: 'number',
            description: 'Amount to distribute to each receiver',
            demandOption: true
        })
        .argv;

    const {
        addresses: addressesPath,
        proofs: proofsPath,
        amount
    } = argv;

    if (!fs.existsSync(addressesPath)) {
        console.error(`❌ Addresses file not found: ${addressesPath}`);
        process.exit(1);
    }

    if (fs.existsSync(proofsPath)) {
        console.error(`❌ Proofs file already exists: ${proofsPath}`);
        process.exit(1);
    }

    try {
        const result = generateProofsFromFile(addressesPath, amount);
        
        const proofsContent = JSON.stringify(result.proofs, null, 2);
        fs.writeFileSync(proofsPath, proofsContent, 'utf8');
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Only run main if this file is being executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}