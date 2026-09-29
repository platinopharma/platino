/**
 * Canonical formatting utilities for Platino Pharma Customer Frontend.
 * Ensures strict compliance with Indian Rupee (INR) and Indian numbering standards.
 */

export const formatINR = (n: number, options?: Intl.NumberFormatOptions): string => {
  if (!Number.isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    ...options,
  }).format(n);
};

/**
 * Legacy compatibility alias for existing dashboard streams.
 */
export function money(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  return formatINR(n, { maximumFractionDigits: 2 });
}

export const formatNumber = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-IN").format(n);
};

export const formatPercentage = (val: number, decimals = 1): string => {
  if (!Number.isFinite(val)) return "0%";
  return `${val.toFixed(decimals)}%`;
};
