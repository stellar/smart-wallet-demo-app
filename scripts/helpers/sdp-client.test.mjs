import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fetchDisbursementReceivers } from './sdp-client.mjs';

function jsonResponse(body) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

test('fetches every page until the reported total is reached', async (t) => {
    const requestUrls = [];
    let requestHeaders;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        requestUrls.push(url);
        requestHeaders = options.headers;
        const page = Number(new URL(url).searchParams.get('page'));
        if (page === 1) {
            return jsonResponse({
                data: [{ id: 'r1', email: 'a@example.com' }, { id: 'r2', email: 'b@example.com' }],
                pagination: { total: 3 }
            });
        }
        return jsonResponse({
            data: [{ id: 'r3', email: 'c@example.com' }],
            pagination: { total: 3 }
        });
    });

    const receivers = await fetchDisbursementReceivers({
        sdpUrl: 'https://sdp.example.com',
        apiKey: 'test-key',
        disbursementId: 'disb-1'
    });

    assert.deepEqual(receivers.map(r => r.id), ['r1', 'r2', 'r3']);
    assert.equal(requestUrls.length, 2);
    assert.equal(requestHeaders.Authorization, 'Bearer test-key');
});

test('returns an empty list for a disbursement with zero receivers', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({ data: [], pagination: { total: 0 } }));

    const receivers = await fetchDisbursementReceivers({
        sdpUrl: 'https://sdp.example.com',
        apiKey: 'test-key',
        disbursementId: 'disb-empty'
    });

    assert.deepEqual(receivers, []);
});

test('aborts when an empty page arrives before the reported total', async (t) => {
    t.mock.method(globalThis, 'fetch', async (url) => {
        const page = Number(new URL(url).searchParams.get('page'));
        if (page === 1) {
            return jsonResponse({ data: [{ id: 'r1', email: 'a@example.com' }], pagination: { total: 3 } });
        }
        return jsonResponse({ data: [], pagination: { total: 3 } });
    });

    await assert.rejects(
        () => fetchDisbursementReceivers({ sdpUrl: 'https://sdp.example.com', apiKey: 'k', disbursementId: 'd' }),
        /empty page/
    );
});

test('throws when pagination.total is missing or not a number', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({ data: [{ id: 'r1', email: 'a@example.com' }] }));

    await assert.rejects(
        () => fetchDisbursementReceivers({ sdpUrl: 'https://sdp.example.com', apiKey: 'k', disbursementId: 'd' }),
        /missing a numeric pagination.total/
    );
});

test('rejects a non-HTTPS sdpUrl', async () => {
    await assert.rejects(
        () => fetchDisbursementReceivers({ sdpUrl: 'http://sdp.example.com', apiKey: 'k', disbursementId: 'd' }),
        /non-HTTPS/
    );
});

test('allows http for localhost', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({ data: [], pagination: { total: 0 } }));

    const receivers = await fetchDisbursementReceivers({
        sdpUrl: 'http://localhost:4000',
        apiKey: 'k',
        disbursementId: 'd'
    });

    assert.deepEqual(receivers, []);
});
