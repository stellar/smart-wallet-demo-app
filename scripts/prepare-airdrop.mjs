import yargs from 'yargs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hideBin } from 'yargs/helpers';

import { fetchDisbursementReceivers } from './helpers/sdp-client.mjs';
import { computeContractAddressFromEmail, resolveNetworkPassphrase } from './helpers/contract-address.mjs';
import { logStep, logSuccess, logWarning, logError, logInfo } from './helpers/logs.mjs';

// Resolves an SDP disbursement's recipients (by email) into the contract addresses
// generate-proofs/deploy-airdrop expect, without the manual, error-prone step of
// cross-referencing SDP's recipient list against separately-computed addresses.
export async function resolveAirdropAddresses({
    sdpUrl,
    apiKey,
    disbursementId,
    distributionAccount,
    network,
    expectedAmount
}) {
    const networkPassphrase = resolveNetworkPassphrase(network);

    logStep('1/3', `Fetching receivers for disbursement ${disbursementId} from ${sdpUrl}`);
    const receivers = await fetchDisbursementReceivers({ sdpUrl, apiKey, disbursementId });
    logInfo(`Found ${receivers.length} receiver(s)`);

    logStep('2/3', 'Validating receivers');
    const seenEmails = new Set();
    const skipped = [];
    const amountMismatches = [];
    const emails = [];

    for (const receiver of receivers) {
        const email = receiver.email?.trim();
        if (!email) {
            skipped.push({ id: receiver.id, reason: 'no email on file' });
            continue;
        }

        const normalizedEmail = email.toLowerCase();
        if (seenEmails.has(normalizedEmail)) {
            skipped.push({ id: receiver.id, reason: `duplicate email ${email}` });
            continue;
        }
        seenEmails.add(normalizedEmail);

        const paymentAmount = receiver.payment?.amount;
        if (expectedAmount != null && paymentAmount != null && Number(paymentAmount) !== Number(expectedAmount)) {
            amountMismatches.push({ email, expected: expectedAmount, actual: paymentAmount });
        }

        emails.push(email);
    }

    if (skipped.length > 0) {
        logWarning(`Skipped ${skipped.length} receiver(s):`);
        skipped.forEach(s => logWarning(`  - ${s.id}: ${s.reason}`));
    }

    if (amountMismatches.length > 0) {
        logWarning(`${amountMismatches.length} receiver(s) have a payment amount different from --amount (${expectedAmount}):`);
        amountMismatches.forEach(m => logWarning(`  - ${m.email}: expected ${m.expected}, got ${m.actual}`));
        logWarning('This script only supports a single flat amount for the whole airdrop. Double-check --amount before continuing.');
    }

    logStep('3/3', `Computing contract addresses for ${emails.length} recipient(s)`);
    const addresses = emails.map(email =>
        computeContractAddressFromEmail(email, distributionAccount, networkPassphrase)
    );

    return { addresses, skipped, amountMismatches };
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .usage('Usage: $0 --sdp-url <url> --sdp-api-key <key> --disbursement-id <id> --distribution-account <G...> --network <testnet|mainnet> [--amount <number>] [--output <path>]')
        .option('sdp-url', {
            type: 'string',
            description: 'Base URL of the SDP backend API',
            demandOption: true
        })
        .option('sdp-api-key', {
            type: 'string',
            description: 'SDP API key with permission to read disbursement receivers',
            demandOption: true
        })
        .option('disbursement-id', {
            type: 'string',
            description: 'SDP disbursement ID to pull receivers from',
            demandOption: true
        })
        .option('distribution-account', {
            type: 'string',
            description: 'Public key (G...) of the SDP distribution account used as the contract deployer',
            demandOption: true
        })
        .option('network', {
            type: 'string',
            choices: ['testnet', 'mainnet'],
            description: 'Stellar network the contract address should be computed for',
            demandOption: true
        })
        .option('amount', {
            type: 'number',
            description: 'Expected flat amount (in stroops) for every recipient. Used only to flag SDP payments that do not match it — this script does not support per-recipient amounts.',
            demandOption: false
        })
        .option('output', {
            type: 'string',
            description: 'Path to write the resolved contract addresses to (one per line)',
            default: 'recipients.txt'
        })
        .help()
        .argv;

    if (fs.existsSync(argv.output)) {
        logError(`Output file already exists: ${argv.output}`);
        process.exit(1);
    }

    try {
        const { addresses, skipped, amountMismatches } = await resolveAirdropAddresses({
            sdpUrl: argv.sdpUrl,
            apiKey: argv.sdpApiKey,
            disbursementId: argv.disbursementId,
            distributionAccount: argv.distributionAccount,
            network: argv.network,
            expectedAmount: argv.amount ?? null
        });

        if (addresses.length === 0) {
            logError('No valid recipients resolved. Nothing was written.');
            process.exit(1);
        }

        fs.writeFileSync(argv.output, addresses.join('\n') + '\n', 'utf8');
        logSuccess(`Wrote ${addresses.length} address(es) to ${argv.output}`);

        if (skipped.length > 0 || amountMismatches.length > 0) {
            logWarning('Review the warnings above before running generate-proofs / deploy-airdrop.');
        }
    } catch (error) {
        logError(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
