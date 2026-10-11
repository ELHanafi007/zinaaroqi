import { listingKeywords } from "@/lib/seo/keywords";
import type { Metadata } from "next";
import { ListingsBrowser } from "@/components/properties/ListingsBrowser";

export const metadata: Metadata = {
  keywords: listingKeywords("build"),
  title: "عمائر ومباني للبيع والإيجار | Buildings",
  description: "تصفح العمائر والمباني المعروضة للبيع والإيجار في المملكة العربية السعودية، مع تفاصيل الشقق والأسعار. Buildings for sale and rent in Saudi Arabia.",
  alternates: { canonical: "/builds" },
};

export default function BuildsPage() {
  return (
    <ListingsBrowser
      fixedCategory="build"
      eyebrowKey="browse.eyebrow"
      titleKey="categoryPages.buildsTitle"
      subtitleKey="categoryPages.buildsSubtitle"
    />
  );
}
