import { test } from 'node:test';
import assert from 'node:assert/strict';

import { assetAmountToStroops } from './amount.mjs';

test('converts valid decimal amounts to stroops', () => {
    const cases = [
        ['0.1', 1000000n],
        ['.1', 1000000n],
        ['10', 100000000n],
        ['0.0000001', 1n],
        ['1.0000001', 10000001n],
        ['0', 0n],
        ['-0.1', -1000000n]
    ];

    for (const [input, expected] of cases) {
        assert.equal(assetAmountToStroops(input), expected, `assetAmountToStroops(${JSON.stringify(input)})`);
    }
});

test('rejects malformed or over-precise decimal amounts instead of truncating them', () => {
    const cases = ['1.2.3', '0.12345678', '1..2', '.', '1.2.', 'abc', '', '-', '-.'];

    for (const input of cases) {
        assert.throws(
            () => assetAmountToStroops(input),
            /Invalid decimal amount/,
            `assetAmountToStroops(${JSON.stringify(input)}) should throw`
        );
    }
});
