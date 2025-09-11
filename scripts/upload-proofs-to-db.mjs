import yargs from 'yargs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hideBin } from 'yargs/helpers';
import pkg from 'pg';
const { Client } = pkg;

export async function uploadProofsToDB(proofsData, contractAddress, databaseUrl = null) {
    const client = new Client({
        connectionString: databaseUrl || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smart_wallet_db'
    });

    try {
        await client.connect();
        console.log('Database connected');

        if (!Array.isArray(proofsData)) {
            throw new Error('Invalid proofs data: expected array');
        }

        const receiverAddresses = new Set();
        const hashRegex = /^[a-f0-9]{64}$/;

        for (let i = 0; i < proofsData.length; i++) {
            const proof = proofsData[i];
            if (typeof proof.index !== 'number' ||
                !proof.receiver?.address ||
                typeof proof.receiver.amount !== 'number' ||
                proof.receiver.amount <= 0 ||
                !Number.isFinite(proof.receiver.amount) ||
                !Array.isArray(proof.proofs)) {
                throw new Error(`Invalid proof at index ${i}: ${JSON.stringify(proof)}`);
            }

            for (let j = 0; j < proof.proofs.length; j++) {
                const hash = proof.proofs[j];
                if (typeof hash !== 'string' || !hashRegex.test(hash)) {
                    throw new Error(`Invalid proof hash at index ${i}, proof ${j}: "${hash}". Must be a 64-character hex string.`);
                }
            }

            if (receiverAddresses.has(proof.receiver.address)) {
                throw new Error(`Duplicate receiver address found in proofs: ${proof.receiver.address}`);
            }
            receiverAddresses.add(proof.receiver.address);
        }

        console.log(`Found ${proofsData.length} proofs to upload for contract ${contractAddress}`);

        await client.query('DELETE FROM proofs WHERE contract_address = $1', [contractAddress]);
        console.log(`Cleared existing proofs for contract ${contractAddress}`);

        const now = new Date();
        for (const proof of proofsData) {
            await client.query(
                `INSERT INTO proofs (receiver_address, contract_address, index, receiver_amount, proofs, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (receiver_address, contract_address) 
                 DO UPDATE SET 
                   index = EXCLUDED.index,
                   receiver_amount = EXCLUDED.receiver_amount,
                   proofs = EXCLUDED.proofs,
                   created_at = EXCLUDED.created_at`,
                [proof.receiver.address, contractAddress, proof.index, proof.receiver.amount.toString(), proof.proofs, now]
            );
        }

        const result = await client.query('SELECT COUNT(*) FROM proofs WHERE contract_address = $1', [contractAddress]);
        const count = parseInt(result.rows[0].count);
        console.log(`✅ Successfully uploaded ${count} proofs for contract ${contractAddress}`);

        return count;
    } catch (error) {
        console.error('❌ Error uploading proofs:', error);
        throw error;
    } finally {
        await client.end();
    }
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .usage('Usage: $0 --proofs <path> --contract <address>')
        .option('proofs', {
            type: 'string',
            description: 'Path to the JSON file containing the proofs',
            demandOption: true,
        })
        .option('contract', {
            type: 'string',
            description: 'Contract address for the airdrop',
            demandOption: true,
        })
        .option('database-url', {
            type: 'string',
            description: 'Database URL for uploading proofs',
            demandOption: false,
        })
        .argv;

    const { proofs: proofsPath, contract: contractAddress, databaseUrl } = argv;

    if (!fs.existsSync(proofsPath)) {
        console.error(`❌ Proofs file not found: ${proofsPath}`);
        process.exit(1);
    }

    try {
        const proofsData = JSON.parse(fs.readFileSync(proofsPath, 'utf8'));
        await uploadProofsToDB(proofsData, contractAddress, databaseUrl);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Only run main if this file is being executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}