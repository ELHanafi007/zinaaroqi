/**
 * Office contact numbers, shown to signed-out visitors in place of a
 * listing's real owner info (name/phone/email are staff-only).
 *
 * Configured for Morocco (+212) DreamX Real Estate office.
 */
export const OFFICE_PHONE_NUMBERS: string[] = [
  process.env.NEXT_PUBLIC_OFFICE_PHONE || "+212 631-305954",
];

export function toInternational(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0")) return `212${digits.slice(1)}`;
  return `212${digits}`;
}

export function officeWhatsAppLink(localNumber: string = OFFICE_PHONE_NUMBERS[0], message?: string): string {
  const intl = toInternational(localNumber);
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${intl}${query}`;
}

export function officeCallLink(localNumber: string = OFFICE_PHONE_NUMBERS[0]): string {
  return `tel:+${toInternational(localNumber)}`;
}
