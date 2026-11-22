// lib/phone.js
//
// Shared (client + server safe) Algerian phone validation — used by both the
// agent console UI and the server-side order adapter.

export const ALGERIAN_PHONE_REGEX = /^(0[567]\d{8}|\+213[567]\d{8})$/;

export function isValidAlgerianPhone(phone) {
  return ALGERIAN_PHONE_REGEX.test(String(phone || "").trim());
}

/**
 * Normalize an Algerian phone number to the digits-only international
 * format wa.me expects (213XXXXXXXXX) — used to open WhatsApp directly
 * against the number a form was filled in with.
 */
export function toWhatsappDigits(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("213")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `213${digits.slice(1)}`;
  return digits;
}
