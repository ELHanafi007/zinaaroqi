/** Normalize Saudi local mobile numbers and international numbers for storage/login. */
export function normalizePhone(value: string): string | null {
  let phone = value.trim().replace(/[٠-٩۰-۹]/g, (digit) =>
    String(digit.charCodeAt(0) - (digit >= "۰" ? 0x06f0 : 0x0660))
  ).replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = "+" + phone.slice(2);
  if (/^05\d{8}$/.test(phone)) phone = "+966" + phone.slice(1);
  else if (/^5\d{8}$/.test(phone)) phone = "+966" + phone;
  else if (/^9665\d{8}$/.test(phone)) phone = "+" + phone;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}
