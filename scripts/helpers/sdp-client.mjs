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
    let total = null;

    while (total === null || receivers.length < total) {
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

        if (typeof body.pagination?.total === 'number') {
            total = body.pagination.total;
        } else if (total === null) {
            total = receivers.length + pageData.length;
        }

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
