/** Only Google Maps URLs are accepted; never embed arbitrary user-provided URLs. */
export function isGoogleMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    decodeURIComponent(url.pathname + url.search);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
    return url.hostname === "maps.app.goo.gl" ||
      (url.hostname === "goo.gl" && url.pathname.startsWith("/maps/")) ||
      (url.hostname === "maps.google.com" && (url.pathname === "/" || url.pathname.startsWith("/maps"))) ||
      (["google.com", "www.google.com"].includes(url.hostname) && url.pathname.startsWith("/maps"));
  } catch { return false; }
}

export function googleMapEmbedUrl(value: string): string | null {
  if (!isGoogleMapsUrl(value)) return null;
  const url = new URL(value);
  if (url.pathname.startsWith("/maps/embed")) return url.href;
  const decoded = decodeURIComponent(url.pathname + url.search);
  // Prefer a place marker over @ coordinates, which describe the viewport center.
  const marker = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const query = url.searchParams.get("q") || url.searchParams.get("query");
  const center = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const place = url.pathname.match(/\/maps\/(?:place|search)\/([^/]+)/);
  const target = marker ? `${marker[1]},${marker[2]}` : query || (place ? decodeURIComponent(place[1]).replace(/\+/g, " ") : center ? `${center[1]},${center[2]}` : null);
  return target ? `https://www.google.com/maps?q=${encodeURIComponent(target)}&output=embed` : null;
}
