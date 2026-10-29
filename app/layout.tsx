import { listingKeywords } from "@/lib/seo/keywords";
import { configuredPublicSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";

export const metadata: Metadata = {
  keywords: listingKeywords(),
  metadataBase: new URL(configuredPublicSiteOrigin() || process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "زين الرقي للعقارات | Zin Aroqi Immobilier",
    // Per-page metadata can just set title: "Apartments" and this template
    // appends the brand automatically, so every page's <title> stays
    // consistent without repeating "| Zin Aroqi" everywhere.
    template: "%s | زين الرقي Zin Aroqi",
  },
  description:
    "Browse apartments, buildings, and land for sale or rent — with clear pricing, verified listings, and direct contact with our office.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "زين الرقي | Zin Aroqi Immobilier",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="font-body antialiased">
        <AuthSessionProvider>
          <LanguageProvider>
            <AppShell>{children}</AppShell>
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
