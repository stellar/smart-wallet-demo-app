const DEFAULT_PAGE_LIMIT = 200;

// GET /disbursements/{id}/receivers, per stellar-disbursement-platform-backend's
// DisbursementHandler.GetDisbursementReceivers. Auth accepts a static API key
// (Authorization: Bearer <key>) via middleware.APIKeyOrJWTAuthenticate, same
// pattern already used for SDP_EMBEDDED_WALLETS_API_KEY elsewhere in this repo.
//
// Paginates by tracking `page`/`page_limit` against the response's
// `pagination.total`, instead of following `pagination.next`: the server builds
// that URL from the request it received, which can point at a host this script
// cannot reach when SDP sits behind a reverse proxy (as it does in stg/dev).
export async function fetchDisbursementReceivers({ sdpUrl, apiKey, disbursementId, pageLimit = DEFAULT_PAGE_LIMIT }) {
    const baseUrl = sdpUrl.replace(/\/$/, '');
    const receivers = [];
    let page = 1;
    let total = Infinity;

    while (receivers.length < total) {
        const url = `${baseUrl}/disbursements/${disbursementId}/receivers?page=${page}&page_limit=${pageLimit}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            throw new Error(`SDP request failed (${response.status} ${response.statusText}) for ${url}: ${body}`);
        }

        const body = await response.json();
        const pageData = Array.isArray(body.data) ? body.data : [];
        if (pageData.length === 0) {
            break; // defensive: avoid looping forever if `total` is ever missing/wrong
        }

        receivers.push(...pageData);
        total = body.pagination?.total ?? receivers.length;
        page += 1;
    }

    return receivers;
}
