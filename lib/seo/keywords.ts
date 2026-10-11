import type { Category, PropertyDTO } from "@/types/property";

export const realEstateKeywords = [
  "عقار", "عقارات", "عقارات السعودية", "عقارات المملكة العربية السعودية",
  "المملكة العربية السعودية", "المملكه العربيه السعوديه", "السعودية",
  "للبيع", "للإيجار", "للايجار", "بيع عقار", "إيجار عقار", "شراء عقار",
  "مكتب عقاري", "عروض عقارية", "استثمار عقاري", "41 للعقارات",
  "real estate", "Saudi real estate", "Saudi Arabia properties", "Kingdom of Saudi Arabia",
  "property for sale", "property for rent", "buy property", "rent property", "real estate office", "property listings", "41 Real Estate",
];
const categoryKeywords: Record<Category, string[]> = {
  apartment: ["شقق", "شقة", "شقق للبيع", "شقق للإيجار", "شقق للايجار", "فلل", "فيلا", "فلل للبيع", "فلل للإيجار", "دوبلكس", "أدوار", "محلات", "apartments", "flats", "villas", "duplex", "shops", "apartments for sale", "apartments for rent"],
  build: ["عمائر", "عمارة", "مباني", "عمائر للبيع", "عمائر للإيجار", "مباني سكنية", "buildings", "residential buildings", "buildings for sale", "buildings for rent"],
  land: ["أرض", "أراضي", "اراضي", "أراضي للبيع", "اراضي للبيع", "قطع أراضٍ", "مخططات", "land for sale", "plots for sale", "Saudi land", "land investment"],
};
export function listingKeywords(category?: Category) {
  return Array.from(new Set([...realEstateKeywords, ...(category ? categoryKeywords[category] : Object.values(categoryKeywords).flat())]));
}
export function propertyKeywords(property: PropertyDTO) {
  const type = property.propertyType || property.category;
  const labels: Record<string, string> = { apartment: "شقة", build: "عمارة", land: "أرض", villa: "فيلا", duplex: "دوبلكس", floor: "دور", shop: "محل", other: "عقار" };
  const offer = property.listingType === "rent" ? "للإيجار" : "للبيع";
  const place = [property.location?.city, property.location?.district].filter(Boolean).join(" ");
  return Array.from(new Set([...realEstateKeywords, property.title, `${labels[type]} ${offer}`, `${type} for ${property.listingType}`, ...(place ? [`عقارات ${place}`, `${labels[type]} ${offer} ${place}`, `${place} real estate`] : [])]));
}
