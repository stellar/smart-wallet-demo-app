import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeContractAddressFromEmail, computeSaltFromEmail, resolveNetworkPassphrase } from './contract-address.mjs';

// Golden values cross-checked against stellar-disbursement-platform-backend's
// actual Go implementation (internal/utils/contract_salt.go +
// contract_address.go), by running both side by side for the same inputs. If
// this test ever fails after touching this file, the JS port has drifted from
// SDP's algorithm and every address this script computes would be wrong.
test("matches SDP's Go implementation for a known email/account/network", () => {
    const email = 'test.user@example.com';
    const distributionAccount = 'GCUZ37M45SEMGYFYYZE7IBTS3ISKGPDLFRNHS73ORSTMNYM64NLEQO76';
    const networkPassphrase = resolveNetworkPassphrase('testnet');

    const salt = computeSaltFromEmail(email);
    assert.equal(
        salt.toString('hex'),
        '3d1fc1f3df634af002628b24cb96facc565364ce38c65c2fc326be4b12b1f8fd'
    );

    const address = computeContractAddressFromEmail(email, distributionAccount, networkPassphrase);
    assert.equal(address, 'CC3LS4WGLR5UPFM6R2ZLWITZ5H5FFZAJ46AY3SBOB5FMYUSM2UCPAN3Y');
});

test('normalizes email case and surrounding whitespace before salting', () => {
    const distributionAccount = 'GCUZ37M45SEMGYFYYZE7IBTS3ISKGPDLFRNHS73ORSTMNYM64NLEQO76';
    const networkPassphrase = resolveNetworkPassphrase('testnet');

    const base = computeContractAddressFromEmail('alice@example.com', distributionAccount, networkPassphrase);
    const upper = computeContractAddressFromEmail('Alice@Example.com', distributionAccount, networkPassphrase);
    const padded = computeContractAddressFromEmail('  alice@example.com  ', distributionAccount, networkPassphrase);

    assert.equal(upper, base);
    assert.equal(padded, base);
});

test('rejects unknown network names', () => {
    assert.throws(() => resolveNetworkPassphrase('devnet'), /Unknown network/);
});
