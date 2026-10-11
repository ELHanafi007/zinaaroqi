import { listingKeywords } from "@/lib/seo/keywords";
import type { Metadata } from "next";
import { ListingsBrowser } from "@/components/properties/ListingsBrowser";

export const metadata: Metadata = {
  keywords: listingKeywords("apartment"),
  title: "شقق وفلل للبيع والإيجار | Apartments & Villas",
  description: "تصفح الشقق والفلل والدوبلكس والأدوار والمحلات المعروضة في السعودية، مع السعر والمواصفات والموقع. Apartments, villas and more for sale or rent in Saudi Arabia.",
  alternates: { canonical: "/apartments" },
};

export default function ApartmentsPage() {
  return (
    <ListingsBrowser
      fixedCategory="apartment"
      eyebrowKey="browse.eyebrow"
      titleKey="categoryPages.apartmentsTitle"
      subtitleKey="categoryPages.apartmentsSubtitle"
    />
  );
}
