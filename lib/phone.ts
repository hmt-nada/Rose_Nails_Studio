import { DEFAULT_COUNTRY_CODE } from "@/lib/constants";

/**
 * Normalizes a phone number for direct tel: links, WhatsApp, and Telegram.
 * - Strips whitespace, dashes, parentheses, dots, and non-digit characters.
 * - Converts a leading '0' into the DEFAULT_COUNTRY_CODE (e.g. 0550... -> 213550...).
 * - Handles international prefix '+' or '00' cleanly.
 */
export function normalizePhone(
  rawPhone: string | null | undefined,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  if (!rawPhone) return "";

  // 1. Trim and remove whitespace, dashes, parentheses, dots, etc.
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]+/g, "");

  // 2. Remove leading '+' or '00'
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // 3. Keep only numeric digits
  cleaned = cleaned.replace(/\D/g, "");

  if (!cleaned) return "";

  // 4. If the number begins with '0', replace that leading 0 with the country code
  if (cleaned.startsWith("0")) {
    cleaned = countryCode + cleaned.substring(1);
  } else if (!cleaned.startsWith(countryCode) && cleaned.length <= 10) {
    // If it's a local number without leading 0 (e.g. 550123456)
    cleaned = countryCode + cleaned;
  }

  return cleaned;
}

/**
 * Helper generating action links for phone call, WhatsApp, and Telegram.
 */
export function getContactLinks(rawPhone: string) {
  const normalized = normalizePhone(rawPhone);
  // tel: link opens native phone dialer on mobile devices
  const callUrl = rawPhone ? `tel:${rawPhone.trim()}` : "";
  const whatsappUrl = normalized ? `https://wa.me/${normalized}` : "";
  const telegramUrl = normalized ? `https://t.me/+${normalized}` : "";

  return {
    normalized,
    callUrl,
    whatsappUrl,
    telegramUrl,
  };
}
