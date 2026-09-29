/**
 * Canonical regulatory and input validators for Platino Pharma Customer Frontend.
 * Centralizes regex schemas for GSTIN, Drug Licenses, Pincodes, and phone numbers.
 */

export const REGEX_PATTERNS = {
  PINCODE: /^[1-9][0-9]{5}$/,
  PHONE_IN: /^[6-9]\d{9}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
  DRUG_LICENSE: /^[A-Z0-9/-]{6,30}$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export function isValidPincode(pincode: string): boolean {
  return REGEX_PATTERNS.PINCODE.test(pincode.trim());
}

export function isValidPhone(phone: string): boolean {
  return REGEX_PATTERNS.PHONE_IN.test(phone.replace(/\D/g, "").slice(-10));
}

export function isValidGstin(gstin: string): boolean {
  return REGEX_PATTERNS.GSTIN.test(gstin.trim());
}

export function isValidDrugLicense(license: string): boolean {
  const clean = license.trim();
  return clean.length >= 6 && clean.length <= 30 && REGEX_PATTERNS.DRUG_LICENSE.test(clean);
}

export function isValidEmail(email: string): boolean {
  return REGEX_PATTERNS.EMAIL.test(email.trim());
}
