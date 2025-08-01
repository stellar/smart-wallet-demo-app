import yargs from 'yargs';
import fs from 'node:fs';
import { hideBin } from 'yargs/helpers';
import pkg from 'pg';
const { Client } = pkg;

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
    .argv;

const { proofs: proofsPath, contract: contractAddress } = argv;

if (!fs.existsSync(proofsPath)) {
    console.error(`❌ Proofs file not found: ${proofsPath}`);
    process.exit(1);
}

function main() {
    async function uploadProofs() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smart_wallet_db'
        });

        try {
            await client.connect();
            console.log('Database connected');

            const proofsData = JSON.parse(fs.readFileSync(proofsPath, 'utf8'));
            
            if (!Array.isArray(proofsData)) {
                console.error('❌ Invalid proofs file: expected array');
                process.exit(1);
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
                    console.error(`❌ Invalid proof at index ${i}: ${JSON.stringify(proof)}`);
                    process.exit(1);
                }
                
                for (let j = 0; j < proof.proofs.length; j++) {
                    const hash = proof.proofs[j];
                    if (typeof hash !== 'string' || !hashRegex.test(hash)) {
                        console.error(`❌ Invalid proof hash at index ${i}, proof ${j}: "${hash}". Must be a 64-character hex string.`);
                        process.exit(1);
                    }
                }
                
                if (receiverAddresses.has(proof.receiver.address)) {
                    console.error(`❌ Duplicate receiver address found in proofs file: ${proof.receiver.address}`);
                    process.exit(1);
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

        } catch (error) {
            console.error('❌ Error uploading proofs:', error);
            process.exit(1);
        } finally {
            await client.end();
        }
    }

    uploadProofs();
}

main();