const DEFAULT_PAGE_LIMIT = 200;
const DEFAULT_TIMEOUT_MS = 15000;

// GET /disbursements/{id}/receivers, per stellar-disbursement-platform-backend's
// DisbursementHandler.GetDisbursementReceivers. The auth middleware
// (internal/serve/middleware/api_keys_middleware.go) splits the Authorization
// header on a single space and validates whatever comes after it (or the whole
// header, if there's no space) as an SDP_ API key — so `Bearer <key>` works
// fine here, even though SDP_EMBEDDED_WALLETS_API_KEY elsewhere in this repo
// sends the raw key with no "Bearer " prefix instead; the two are not the same
// convention, just both accepted by this particular middleware.
//
// Paginates by tracking `page`/`page_limit` against the response's
// `pagination.total`, instead of following `pagination.next`: the server builds
// that URL from the request it received, which can point at a host this script
// cannot reach when SDP sits behind a reverse proxy (as it does in stg/dev).
export async function fetchDisbursementReceivers({
    sdpUrl,
    apiKey,
    disbursementId,
    pageLimit = DEFAULT_PAGE_LIMIT,
    timeoutMs = DEFAULT_TIMEOUT_MS
}) {
    assertSecureUrl(sdpUrl);

    const baseUrl = sdpUrl.replace(/\/$/, '');
    const receivers = [];
    let page = 1;
    let total = null;

    while (total === null || receivers.length < total) {
        const url = `${baseUrl}/disbursements/${disbursementId}/receivers?page=${page}&page_limit=${pageLimit}`;

        let response;
        try {
            response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: 'application/json'
                },
                signal: AbortSignal.timeout(timeoutMs)
            });
        } catch (error) {
            throw new Error(`SDP request to ${url} timed out or failed after ${timeoutMs}ms: ${error.message}`);
        }

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            throw new Error(`SDP request failed (${response.status} ${response.statusText}) for ${url}: ${body}`);
        }

        const body = await response.json();
        const pageData = Array.isArray(body.data) ? body.data : [];

        // Real SDP always serializes pagination.total (no `omitempty`), even when
        // it's 0. Requiring it — rather than guessing from the current page's
        // size — avoids silently capping the result at whatever page 1 happened
        // to contain.
        if (typeof body.pagination?.total !== 'number') {
            throw new Error(
                `SDP response for page=${page} is missing a numeric pagination.total — ` +
                'cannot safely determine when all receivers have been fetched.'
            );
        }
        total = body.pagination.total;

        // An empty page is only expected once we've already collected `total`
        // receivers (checked by the while condition above). Getting one before
        // that means SDP's data changed or is inconsistent between requests —
        // abort loudly instead of silently writing a partial recipients list.
        if (pageData.length === 0 && receivers.length < total) {
            throw new Error(
                `SDP returned an empty page (page=${page}) before reaching the reported total ` +
                `(${receivers.length}/${total} receivers collected so far). Aborting instead of ` +
                'writing an incomplete recipients list.'
            );
        }

        receivers.push(...pageData);
        page += 1;
    }

    return receivers;
}

function assertSecureUrl(sdpUrl) {
    const parsed = new URL(sdpUrl);
    const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (parsed.protocol !== 'https:' && !isLocal) {
        throw new Error(
            `Refusing to send the SDP API key over a non-HTTPS URL: ${sdpUrl}. ` +
            'Use https:// (localhost is exempt for local testing).'
        );
    }
}
