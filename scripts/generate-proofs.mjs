import yargs from 'yargs';
import fs from 'node:fs';
import { hideBin } from 'yargs/helpers'
import { generateMerkleProofs } from './helpers/merkle.mjs';

const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --receivers <path> --proofs <path>')
    .option('receivers', {
        type: 'string',
        description: 'Path to the JSON file containing the receivers',
        demandOption: true
    })
    .option('proofs', {
        type: 'string',
        description: 'Path to the output JSON file for the proofs',
        demandOption: true
    })
    .argv;

const {
    receivers: receiversPath,
    proofs: proofsPath
} = argv;

if (!fs.existsSync(receiversPath)) {
    console.error(`❌ Receivers file not found: ${receiversPath}`);
    process.exit(1);
}

if (fs.existsSync(proofsPath)) {
    console.error(`❌ Proofs file already exists: ${proofsPath}`);
    process.exit(1);
}

function main() {
    const receiversData = fs.readFileSync(receiversPath, 'utf8');
    const receivers = JSON.parse(receiversData);

    for (let i = 0; i < receivers.length; i++) {
        const receiver = receivers[i];
        if (!receiver.address || typeof receiver.address !== 'string') {
            console.error(`❌ Invalid receiver at index ${i}: ${JSON.stringify(receiver)}`);
            process.exit(1);
        }
        if (typeof receiver.amount !== 'number' || receiver.amount <= 0) {
            console.error(`❌ Invalid amount for receiver at index ${i}: ${JSON.stringify(receiver)}`);
            process.exit(1);
        }
    }

    const result = generateMerkleProofs(receivers);
    
    const proofsContent = JSON.stringify(result.proofs, null, 2);
    fs.writeFileSync(proofsPath, proofsContent, 'utf8');

    console.log(`✅ Merkle proofs generated successfully with root: ${result.root}`);
}

main()