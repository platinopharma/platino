/**
 * Canonical regulatory and input validators for Platino Pharma User Frontend.
 * Centralizes regex schemas for Pincodes, Phone numbers, Emails, and IDs.
 */

export const REGEX_PATTERNS = {
  PINCODE: /^\d{6}$/,
  PHONE_IN: /^[6-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export function isValidPincode(pincode?: string): boolean {
  if (!pincode) return false;
  return REGEX_PATTERNS.PINCODE.test(pincode.trim());
}

export function isValidPhone(phone: string): boolean {
  return REGEX_PATTERNS.PHONE_IN.test(phone.replace(/\D/g, "").slice(-10));
}

export function isValidEmail(email: string): boolean {
  return REGEX_PATTERNS.EMAIL.test(email.trim());
}
