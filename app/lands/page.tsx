import { listingKeywords } from "@/lib/seo/keywords";
import type { Metadata } from "next";
import { ListingsBrowser } from "@/components/properties/ListingsBrowser";

export const metadata: Metadata = {
  keywords: listingKeywords("land"),
  title: "أراضي للبيع في السعودية | Land for Sale",
  description: "اكتشف أراضي وقطع أراضٍ للبيع في المملكة العربية السعودية، مع الأسعار والمواقع. Browse land and plots for sale in Saudi Arabia.",
  alternates: { canonical: "/lands" },
};

export default function LandsPage() {
  return (
    <ListingsBrowser
      fixedCategory="land"
      eyebrowKey="browse.eyebrow"
      titleKey="categoryPages.landsTitle"
      subtitleKey="categoryPages.landsSubtitle"
    />
  );
}
