/**
 * Central currency helper for the Moroccan market.
 *
 * Every price in the product is a Moroccan dirham amount. Keeping the code,
 * the symbol and the locale in one place is what stops the app from drifting
 * into a mix of "SAR", a hardcoded "ر.س" and raw numbers again.
 *
 * Number formatting follows the Moroccan French convention (`fr-MA`): a dot
 * groups thousands and a comma separates decimals — "1.250.000". Arabic uses
 * the same Western Arabic numerals (`ar-MA-u-nu-latn`) because that is how
 * prices are actually written on Moroccan listings, while still using
 * the Moroccan dirham symbol.
 */

/** ISO 4217 code used for every amount in the database and in metadata. */
export const CURRENCY_CODE = "MAD";

/** ISO 3166-1 alpha-2 country code, used for schema.org structured data. */
export const CURRENCY_COUNTRY = "MA";

export type CurrencyLocale = "en" | "ar" | "fr";

const CURRENCY_LOCALES: Record<CurrencyLocale, string> = {
  en: "fr-MA",
  fr: "fr-MA",
  ar: "ar-MA-u-nu-latn",
};

/**
 * The symbol shown next to an amount. Arabic uses the local "د.م." while
 * the Latin-script locales use the ISO code, which is how Moroccan listings
 * are commonly written for an international audience.
 */
const CURRENCY_SYMBOLS: Record<CurrencyLocale, string> = {
  en: "MAD",
  fr: "MAD",
  ar: "د.م.",
};

function resolveLocale(locale: CurrencyLocale | undefined): CurrencyLocale {
  return locale && locale in CURRENCY_LOCALES ? locale : "en";
}

/** The currency symbol for a locale, e.g. "MAD" or "د.م.". */
export function currencySymbol(locale: CurrencyLocale = "en"): string {
  return CURRENCY_SYMBOLS[resolveLocale(locale)];
}

/**
 * Formats a numeric amount without any currency symbol. Grouping and decimal
 * separators follow the Moroccan convention. Never format a price by
 * string-manipulating this result — keep the raw number for sorting and
 * filtering, and format only at the edges.
 */
export function formatAmount(amount: number, locale: CurrencyLocale = "en"): string {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat(CURRENCY_LOCALES[resolveLocale(locale)], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a numeric amount with its currency symbol, e.g. "1.250.000 MAD" or
 * "1.250.000 د.م.". The result is plain text with no directional marks, so
 * callers should render it inside a <bdi dir="ltr"> to keep it readable in
 * an RTL paragraph.
 */
export function formatCurrency(amount: number, locale: CurrencyLocale = "en"): string {
  if (!Number.isFinite(amount)) return "";
  return `${formatAmount(amount, locale)} ${currencySymbol(locale)}`;
}

/** Compact form used for map pin labels, e.g. "1,3 M MAD". */
export function formatCompactAmount(amount: number, locale: CurrencyLocale = "en"): string {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat(CURRENCY_LOCALES[resolveLocale(locale)], {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Normalizes a price typed by a staff member into a canonical numeric
 * string, or returns null when the input cannot be a price.
 *
 * Accepts the grouping and decimal separators produced by `formatAmount`
 * ("1.250.000" and "1.250,75"), plain digits, and Arabic-Indic digits with
 * the Arabic thousands and decimal separators. A dot followed by exactly
 * three digits is treated as a thousands separator, matching the Moroccan
 * format the app displays; anything else with a dot is a decimal point.
 */
export function normalizeNumericInput(value: string): string | null {
  const ascii = value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x6f0))
    .replace(/٬/g, ",")
    .replace(/٫/g, ".")
    // Spaces of every kind, including the narrow no-break space `fr-MA`
    // uses to group thousands.
    .replace(/[\s  ]/g, "");

  if (ascii === "") return "";
  if (!/^[\d.,]+$/.test(ascii)) return null;

  // Thousands separators: a dot immediately followed by exactly three digits.
  const grouped = ascii.replace(/(?<=\d)\.(?=\d{3}(?!\d))/g, "");

  const commas = grouped.split(",").length - 1;
  const dots = grouped.split(".").length - 1;
  if (commas > 1 || dots > 1) return null;

  const decimal = commas === 1 ? grouped.replace(",", ".") : grouped;
  if (!/^\d+(\.\d{0,2})?$/.test(decimal)) return null;
  return decimal;
}

/**
 * Parses user input into a numeric amount. Returns null when the input is
 * not a usable number.
 */
export function parseAmount(value: string): number | null {
  const normalized = normalizeNumericInput(value);
  if (normalized === null || normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
