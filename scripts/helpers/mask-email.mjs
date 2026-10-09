// Masks an email for terminal/CI logs — keeps enough to spot which receiver a
// warning is about without printing the full address (PII) into logs that may
// be retained (CI output, shared terminals), including on mainnet runs.
export function maskEmail(email) {
    const [localPart = '', domain = ''] = String(email).split('@');
    const visible = localPart.slice(0, 1) || '*';
    return `${visible}***@${domain}`;
}
