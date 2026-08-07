const STROOPS_PER_UNIT = 10000000n; // 1 unit of any Stellar asset = 10^7 stroops

// Converts a decimal asset-unit amount, as returned by SDP's payment records
// (e.g. "0.1" XLM), into an integer stroops amount. Uses string/BigInt
// arithmetic instead of Number() — floating point would silently misround
// fractional amounts and break the stroops comparison against --amount.
export function assetAmountToStroops(decimalAmount) {
    const trimmed = String(decimalAmount).trim();
    const isNegative = trimmed.startsWith('-');
    const unsigned = isNegative ? trimmed.slice(1) : trimmed;
    const [wholePart = '', fractionalPart = ''] = unsigned.split('.');

    if (!/^\d*$/.test(wholePart) || !/^\d*$/.test(fractionalPart)) {
        throw new Error(`Invalid decimal amount: ${decimalAmount}`);
    }

    const fractionalStroops = fractionalPart.padEnd(7, '0').slice(0, 7);
    const stroops = BigInt(wholePart || '0') * STROOPS_PER_UNIT + BigInt(fractionalStroops || '0');

    return isNegative ? -stroops : stroops;
}
