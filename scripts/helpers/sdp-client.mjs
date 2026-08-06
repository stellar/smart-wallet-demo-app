const DEFAULT_PAGE_LIMIT = 200;

// GET /disbursements/{id}/receivers, per stellar-disbursement-platform-backend's
// DisbursementHandler.GetDisbursementReceivers. Auth accepts a static API key
// (Authorization: Bearer <key>) via middleware.APIKeyOrJWTAuthenticate, same
// pattern already used for SDP_EMBEDDED_WALLETS_API_KEY elsewhere in this repo.
export async function fetchDisbursementReceivers({ sdpUrl, apiKey, disbursementId, pageLimit = DEFAULT_PAGE_LIMIT }) {
    const baseUrl = sdpUrl.replace(/\/$/, '');
    let url = `${baseUrl}/disbursements/${disbursementId}/receivers?page=1&page_limit=${pageLimit}`;
    const receivers = [];

    while (url) {
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
        const page = Array.isArray(body.data) ? body.data : [];
        receivers.push(...page);

        url = body.pagination?.next || null;
    }

    return receivers;
}
