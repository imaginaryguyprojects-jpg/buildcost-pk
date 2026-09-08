/**
 * Formats a currency amount with standard prefix (e.g. "PKR 2,999")
 */
export function formatCurrency(amount: number, currency: string = "PKR"): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currency} 0`;
  }
  const rounded = Math.round(amount);
  return `${currency} ${rounded.toLocaleString("en-PK")}`;
}

/**
 * Formats a number as Pakistani Rupees (Rs. X,XXX,XXX)
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rs. 0";
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString("en-PK")}`;
}

/**
 * Formats an amount using Pakistani financial vernacular (Lakh / Crore)
 */
export function formatLakhCrore(amount: number): string {
  if (!amount || isNaN(amount)) return "Rs. 0";
  const abs = Math.abs(amount);

  if (abs >= 10000000) {
    // 1 Crore = 10,000,000
    const crore = amount / 10000000;
    return `Rs. ${crore.toFixed(2)} Crore`;
  } else if (abs >= 100000) {
    // 1 Lakh = 100,000
    const lakh = amount / 100000;
    return `Rs. ${lakh.toFixed(2)} Lakh`;
  } else if (abs >= 1000) {
    const k = amount / 1000;
    return `Rs. ${k.toFixed(1)}k`;
  }

  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}

/**
 * Displays both full numeric and compact Lakh/Crore representation
 */
export function formatDualCurrency(amount: number): { full: string; compact: string } {
  return {
    full: formatPKR(amount),
    compact: formatLakhCrore(amount)
  };
}

/**
 * Formats numbers with units
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (isNaN(value)) return "0";
  return value.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
