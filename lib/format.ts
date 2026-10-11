export function formatPrice(price: number, locale: "en" | "ar" = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatPriceWithPeriod(
  price: number | undefined,
  listingType: "sale" | "rent",
  rentalPeriod?: "monthly" | "yearly",
  t?: (path: string) => string,
  locale: "en" | "ar" = "en"
): string {
  if (price == null) return t ? t("property.priceOnRequest") : "Price on request";
  const sar = t ? t("common.sar") : "SAR";
  const monthly = t ? t("form.monthly") : "mo";
  const yearly = t ? t("form.yearly") : "yr";
  const base = `${formatPrice(price, locale)} ${sar}`;
  if (listingType === "rent" && rentalPeriod) {
    return `${base} / ${rentalPeriod === "monthly" ? monthly : yearly}`;
  }
  return base;
}

export function formatDate(iso: string, locale: "en" | "ar" = "en"): string {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatLocation(
  location: { address?: string; city?: string; district?: string } | undefined,
  t?: (path: string) => string
): string {
  if (!location) return t ? t("property.locationNotSpecified") : "Location not specified";
  const parts = [location.district, location.city].filter(Boolean).join(", ");
  return parts || (t ? t("property.locationNotSpecified") : "Location not specified");
}

/** Accept pasted grouping and Arabic digits while preserving the raw decimal amount. */
export function normalizePriceInput(value: string): string | null {
  const normalized = value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x6f0))
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".");
  return /^\d*(?:\.\d{0,2})?$/.test(normalized) ? normalized : null;
}
