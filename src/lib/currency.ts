export function formatCurrencyNumber(amount: number, decimals = 2): string {
  // Convert from cents to decimal amount
  const decimalAmount = amount / 10 ** decimals;

  // Try to get browser locale, fallback to env variable or 'en-US' as last resort
  const locale =
    (typeof window !== 'undefined' && navigator.language) ||
    process.env.NEXT_PUBLIC_LOCALE ||
    'en-US';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(decimalAmount);
}
