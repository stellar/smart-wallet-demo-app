export const formatNumber = (
  amount: number,
  locale = 'en-US',
  charLimit = 14,
  minFraction = 2,
  maxFraction = 4
): string => {
  let fractionDigits = maxFraction

  while (fractionDigits >= minFraction) {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: minFraction,
      maximumFractionDigits: fractionDigits,
    }).format(amount)

    if (formatted.length <= charLimit) {
      return formatted
    }

    fractionDigits--
  }

  // As fallback, return with minFractionDigits even if over limit
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: minFraction,
  }).format(amount)
}
