const STROOPS_PER_UNIT = 10000000n; // 1 unit of any Stellar asset = 10^7 stroops

// Converts a decimal asset-unit amount, as returned by SDP's payment records
// (e.g. "0.1" XLM), into an integer stroops amount. Uses string/BigInt
// arithmetic instead of Number() — floating point would silently misround
// fractional amounts and break the stroops comparison against --amount.
export function assetAmountToStroops(decimalAmount) {
    const trimmed = String(decimalAmount).trim();
    const isNegative = trimmed.startsWith('-');
    const unsigned = isNegative ? trimmed.slice(1) : trimmed;
    const parts = unsigned.split('.');
    if (parts.length > 2) {
        throw new Error(`Invalid decimal amount: ${decimalAmount}`);
    }
    const [wholePart = '', fractionalPart = ''] = parts;

    // Stellar amounts have at most 7 decimal places (stroops precision) — reject
    // anything more precise instead of silently truncating it to fit. Also
    // reject "" / "." / "-": at least one digit must be present somewhere.
    if (
        !/^\d*$/.test(wholePart) ||
        !/^\d*$/.test(fractionalPart) ||
        fractionalPart.length > 7 ||
        (wholePart === '' && fractionalPart === '')
    ) {
        throw new Error(`Invalid decimal amount: ${decimalAmount}`);
    }

    const fractionalStroops = fractionalPart.padEnd(7, '0');
    const stroops = BigInt(wholePart || '0') * STROOPS_PER_UNIT + BigInt(fractionalStroops || '0');

    return isNegative ? -stroops : stroops;
}
