import {
  CURRENCY_CODE,
  formatAmount,
  normalizeNumericInput,
  type CurrencyLocale,
} from "./currency";

export type { CurrencyLocale };

/**
 * Formats a price amount using the Moroccan convention. The currency symbol
 * is added by `formatPriceWithPeriod` (and by the UI components) so the
 * number and the symbol can be laid out independently for RTL.
 */
export function formatPrice(price: number, locale: CurrencyLocale = "en"): string {
  return formatAmount(price, locale);
}

export function formatPriceWithPeriod(
  price: number | undefined,
  listingType: "sale" | "rent",
  rentalPeriod?: "monthly" | "yearly",
  t?: (path: string) => string,
  locale: CurrencyLocale = "en"
): string {
  if (price == null) return t ? t("property.priceOnRequest") : "Price on request";
  const currency = t ? t("common.currency") : CURRENCY_CODE;
  const monthly = t ? t("form.monthly") : "mo";
  const yearly = t ? t("form.yearly") : "yr";
  const base = `${formatPrice(price, locale)} ${currency}`;
  if (listingType === "rent" && rentalPeriod) {
    return `${base} / ${rentalPeriod === "monthly" ? monthly : yearly}`;
  }
  return base;
}

export function formatDate(iso: string, locale: CurrencyLocale = "en"): string {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-MA-u-nu-latn" : "fr-MA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatLocation(
  location: { address?: string; city?: string; district?: string; bloc?: string; number?: string } | undefined,
  t?: (path: string) => string
): string {
  if (!location) return t ? t("property.locationNotSpecified") : "Location not specified";
  const parts: string[] = [];
  if (location.district) parts.push(location.district);
  if (location.bloc) parts.push(`Bloc ${location.bloc}`);
  if (location.number) parts.push(`N° ${location.number}`);
  if (location.city) parts.push(location.city);
  return parts.join(", ") || (t ? t("property.locationNotSpecified") : "Location not specified");
}

/**
 * Accepts pasted grouping and Arabic digits while preserving the raw decimal
 * amount. The canonical result uses a dot as the decimal separator so it can
 * be handed straight to `Number()` for sorting and filtering.
 */
export function normalizePriceInput(value: string): string | null {
  return normalizeNumericInput(value);
}
