/** Normalize a public HTTP(S) origin for links recipients can open. */
export function publicSiteOrigin(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname === "[::1]" || hostname === "[::]" || hostname === "0.0.0.0") return null;
    const ipv4 = hostname.split(".").map(Number);
    if (ipv4.length === 4 && ipv4.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
      if (ipv4[0] === 127 || ipv4[0] === 10 || (ipv4[0] === 192 && ipv4[1] === 168) || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) || (ipv4[0] === 169 && ipv4[1] === 254)) return null;
    }
    return url.origin;
  } catch { return null; }
}

export function configuredPublicSiteOrigin(): string | null {
  return publicSiteOrigin(process.env.SITE_URL) || publicSiteOrigin(process.env.NEXTAUTH_URL) ||
    publicSiteOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null);
}
