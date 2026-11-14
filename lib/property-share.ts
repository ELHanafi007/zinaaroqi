import type { PropertyDTO } from "@/types/property";
import { isGoogleMapsUrl } from "./maps";

/** Prefer the saved location, with compatibility for older links in descriptions. */
export function propertyLocationUrl(property: Pick<PropertyDTO, "location" | "description">): string | null {
  const saved = property.location?.mapUrl?.trim();
  if (saved && isGoogleMapsUrl(saved)) return saved;
  const links = property.description?.match(/https:\/\/[^\s<>"']+/g) ?? [];
  for (const link of links) {
    const cleaned = link.replace(/[)\]،.,;]+$/, "");
    if (isGoogleMapsUrl(cleaned)) return cleaned;
  }
  const address = [property.location?.address, property.location?.district, property.location?.city]
    .map((part) => part?.trim()).filter(Boolean).join(", ");
  return address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}` : null;
}

export function propertyShareMessage(title: string, propertyUrl: string, locationUrl: string | null, locationLabel: string): string {
  return [title, propertyUrl, locationUrl ? `\n📍 ${locationLabel}\n${locationUrl}` : ""].filter(Boolean).join("\n");
}

export function propertyInquiryMessage(property: PropertyDTO, propertyUrl: string, locale: "ar" | "en" | "fr" = "ar"): string {
  const isAr = locale === "ar";
  const isFr = locale === "fr";

  const lines: string[] = [];

  if (isAr) {
    lines.push("السلام عليكم ورحمة الله، أنا مهتم بهذا العقار وأود الاستفسار عن تفاصيله:");
  } else if (isFr) {
    lines.push("Bonjour, je suis intéressé(e) par cette propriété et je souhaiterais avoir plus d'informations :");
  } else {
    lines.push("Hello, I am interested in this property and would like to inquire about more details:");
  }

  lines.push("");
  lines.push(`🏡 *${property.title}*`);

  // Type & category
  const categoryLabel = {
    apartment: isAr ? "شقة" : isFr ? "Appartement" : "Apartment",
    build: isAr ? "عمارة / مبنى" : isFr ? "Immeuble / Bâtiment" : "Building",
    land: isAr ? "أرض" : isFr ? "Terrain" : "Land",
  }[property.category] || property.category;

  const listingTypeLabel = {
    sale: isAr ? "للبيع" : isFr ? "À vendre" : "For Sale",
    rent: isAr ? "للكراء" : isFr ? "À louer" : "For Rent",
  }[property.listingType] || property.listingType;

  lines.push(`📋 ${isAr ? "النوع" : "Type"}: ${categoryLabel} (${listingTypeLabel})`);

  // Price
  if (property.price != null) {
    const formattedPrice = new Intl.NumberFormat("fr-MA").format(property.price);
    const periodLabel = property.listingType === "rent" && property.rentalPeriod
      ? (property.rentalPeriod === "monthly"
          ? (isAr ? "/ شهرياً" : isFr ? "/ mois" : "/ month")
          : (isAr ? "/ سنوياً" : isFr ? "/ an" : "/ year"))
      : "";
    lines.push(`💰 ${isAr ? "السعر" : isFr ? "Prix" : "Price"}: ${formattedPrice} MAD ${periodLabel}`.trim());
  }

  // Location / Address
  const locParts = [
    property.location?.district,
    property.location?.bloc ? `${isAr ? "بلوك" : "Bloc"} ${property.location.bloc}` : null,
    property.location?.number ? `N° ${property.location.number}` : null,
    property.location?.city,
    property.location?.address,
  ].filter(Boolean);

  if (locParts.length > 0) {
    lines.push(`📍 ${isAr ? "الموقع" : isFr ? "Emplacement" : "Location"}: ${locParts.join(", ")}`);
  }

  // Specs & details
  const d = property.details;
  if (d) {
    const specs: string[] = [];
    if (d.area) specs.push(`${d.area} m²`);
    if (d.rooms != null) specs.push(`${d.rooms} ${isAr ? "غرف" : isFr ? "chambres" : "rooms"}`);
    if (d.bathrooms != null) specs.push(`${d.bathrooms} ${isAr ? "حمامات" : isFr ? "salles de bain" : "bathrooms"}`);
    if (specs.length > 0) {
      lines.push(`📐 ${isAr ? "المواصفات" : isFr ? "Caractéristiques" : "Specs"}: ${specs.join(" • ")}`);
    }
  }

  if (propertyUrl) {
    lines.push("");
    lines.push(`🔗 ${isAr ? "رابط الإعلان" : isFr ? "Lien de l'annonce" : "Listing link"}:`);
    lines.push(propertyUrl);
  }

  lines.push("");
  if (isAr) {
    lines.push("هل العقار ما زال متاحاً؟ وهل يمكن ترتيب موعد للمعاينة؟ شكراً لكم.");
  } else if (isFr) {
    lines.push("Le bien est-il toujours disponible ? Est-il possible d'organiser une visite ? Merci.");
  } else {
    lines.push("Is this property still available? Could we schedule a visit? Thank you.");
  }

  return lines.join("\n");
}

export function whatsappRecipient(value: string): string | null {
  const digits = value.trim().replace(/[\s()+-]/g, "");
  // International number, including country code. Never infer a country.
  return /^[1-9]\d{7,14}$/.test(digits) ? `${digits}@c.us` : null;
}

