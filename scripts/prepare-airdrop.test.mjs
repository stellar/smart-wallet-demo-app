import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveAirdropAddresses } from './prepare-airdrop.mjs';
import { computeContractAddressFromEmail, resolveNetworkPassphrase } from './helpers/contract-address.mjs';

function jsonResponse(body) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

const DISTRIBUTION_ACCOUNT = 'GCUZ37M45SEMGYFYYZE7IBTS3ISKGPDLFRNHS73ORSTMNYM64NLEQO76';

test('skips receivers with no email and de-duplicates case-insensitively', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({
        data: [
            { id: 'r1', email: 'alice@example.com', payment: { amount: '0.1' } },
            { id: 'r2', email: 'Alice@Example.com', payment: { amount: '0.1' } }, // duplicate, different case
            { id: 'r3', email: '', payment: { amount: '0.1' } }, // no email
            { id: 'r4', email: 'bob@example.com', payment: { amount: '0.1' } }
        ],
        pagination: { total: 4 }
    }));

    const { addresses, skipped, amountMismatches } = await resolveAirdropAddresses({
        sdpUrl: 'https://sdp.example.com',
        apiKey: 'k',
        disbursementId: 'd',
        distributionAccount: DISTRIBUTION_ACCOUNT,
        network: 'testnet',
        expectedAmount: 1000000
    });

    const networkPassphrase = resolveNetworkPassphrase('testnet');
    const expectedAddresses = ['alice@example.com', 'bob@example.com'].map(email =>
        computeContractAddressFromEmail(email, DISTRIBUTION_ACCOUNT, networkPassphrase)
    );

    assert.deepEqual(addresses, expectedAddresses);
    assert.equal(skipped.length, 2);
    assert.ok(skipped.some(s => s.id === 'r3' && s.reason === 'no email on file'));
    assert.ok(skipped.some(s => s.id === 'r2' && s.reason.includes('duplicate email')));
    assert.equal(amountMismatches.length, 0);
});

test('flags payments whose amount does not match --amount, without dropping the recipient', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({
        data: [
            { id: 'r1', email: 'alice@example.com', payment: { amount: '0.1' } },
            { id: 'r2', email: 'carol@example.com', payment: { amount: '0.05' } }
        ],
        pagination: { total: 2 }
    }));

    const { addresses, amountMismatches } = await resolveAirdropAddresses({
        sdpUrl: 'https://sdp.example.com',
        apiKey: 'k',
        disbursementId: 'd',
        distributionAccount: DISTRIBUTION_ACCOUNT,
        network: 'testnet',
        expectedAmount: 1000000 // 0.1 XLM in stroops
    });

    assert.equal(addresses.length, 2); // still included, just flagged
    assert.equal(amountMismatches.length, 1);
    assert.equal(amountMismatches[0].email, 'carol@example.com');
    assert.equal(amountMismatches[0].expected, 1000000);
    assert.equal(amountMismatches[0].actual, '500000');
});

test('does not flag any mismatch when expectedAmount is not provided', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({
        data: [{ id: 'r1', email: 'alice@example.com', payment: { amount: '0.1' } }],
        pagination: { total: 1 }
    }));

    const { amountMismatches } = await resolveAirdropAddresses({
        sdpUrl: 'https://sdp.example.com',
        apiKey: 'k',
        disbursementId: 'd',
        distributionAccount: DISTRIBUTION_ACCOUNT,
        network: 'testnet',
        expectedAmount: null
    });

    assert.equal(amountMismatches.length, 0);
});
