import { listingKeywords } from "@/lib/seo/keywords";
import type { Metadata } from "next";
import { ListingsBrowser } from "@/components/properties/ListingsBrowser";

export const metadata: Metadata = {
  keywords: listingKeywords(),
  title: "عقارات للبيع والإيجار في السعودية | Saudi Real Estate",
  description: "اكتشف شققًا وفللًا وعمائر وأراضي للبيع والإيجار في المملكة العربية السعودية، مع الأسعار والمواصفات والمواقع. Browse Saudi properties for sale and rent.",
  alternates: { canonical: "/" },
};

export default function BrowsePage() {
  return (
    <ListingsBrowser
      eyebrowKey="browse.eyebrow"
      titleKey="browse.title"
      subtitleKey="browse.subtitle"
    />
  );
}
