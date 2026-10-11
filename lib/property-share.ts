import type { PropertyDTO } from "@/types/property";
import { isGoogleMapsUrl } from "./maps";

/** Prefer the saved location, with compatibility for older links in descriptions. */
export function propertyLocationUrl(property: Pick<PropertyDTO, "location" | "description">): string | null {
  const saved = property.location?.mapUrl?.trim();
  if (saved && isGoogleMapsUrl(saved)) return saved;
  const links = property.description.match(/https:\/\/[^\s<>"']+/g) ?? [];
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

export function whatsappRecipient(value: string): string | null {
  const digits = value.trim().replace(/[\s()+-]/g, "");
  // International number, including country code. Never infer a country.
  return /^[1-9]\d{7,14}$/.test(digits) ? `${digits}@c.us` : null;
}

