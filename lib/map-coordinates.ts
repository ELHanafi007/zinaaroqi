import { isGoogleMapsUrl } from "./maps";

// In-memory cache for resolved short URLs so redirects are only resolved once per process
const resolvedCoordsCache = new Map<string, [number, number] | null>();

/**
 * Synchronous coordinate extractor from full Google Maps URLs
 */
export function mapCoordinates(value: string): [number, number] | null {
  if (!isGoogleMapsUrl(value)) return null;
  try {
    const url = new URL(value);
    const decoded = decodeURIComponent(url.pathname + url.search);

    // 1. Precise marker: !3d<lat>!4d<lng>
    const marker = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (marker) {
      const pt = validateCoords(Number(marker[1]), Number(marker[2]));
      if (pt) return pt;
    }

    // 2. Query param: ?q=<lat>,<lng> or ?query=<lat>,<lng>
    const queryParam = url.searchParams.get("q") || url.searchParams.get("query") || url.searchParams.get("ll");
    if (queryParam) {
      const qMatch = queryParam.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
      if (qMatch) {
        const pt = validateCoords(Number(qMatch[1]), Number(qMatch[2]));
        if (pt) return pt;
      }
    }

    // 3. Path /maps/search/<lat>,<lng> or /maps/place/<lat>,<lng>
    const pathCoords = decoded.match(/\/(?:search|place)\/(-?\d+(?:\.\d+)?)(?:,|\+|\s)+(-?\d+(?:\.\d+)?)/);
    if (pathCoords) {
      const pt = validateCoords(Number(pathCoords[1]), Number(pathCoords[2]));
      if (pt) return pt;
    }

    // 4. Viewport center: @<lat>,<lng>
    const center = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (center) {
      const pt = validateCoords(Number(center[1]), Number(center[2]));
      if (pt) return pt;
    }

    return null;
  } catch {
    return null;
  }
}

function validateCoords(lat: number, lng: number): [number, number] | null {
  if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return [lat, lng];
  }
  return null;
}

/**
 * Asynchronously resolve coordinates, automatically following redirects for
 * shortened URLs (maps.app.goo.gl, goo.gl). Results are cached in-memory.
 */
export async function resolveMapCoordinates(value: string): Promise<[number, number] | null> {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();

  // Try direct synchronous extraction first
  const direct = mapCoordinates(trimmed);
  if (direct) return direct;

  if (!isGoogleMapsUrl(trimmed)) return null;

  // Check cache
  if (resolvedCoordsCache.has(trimmed)) {
    return resolvedCoordsCache.get(trimmed)!;
  }

  // Follow redirects for short URLs
  let currentUrl = trimmed;
  try {
    for (let i = 0; i < 5; i++) {
      const res = await fetch(currentUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(4000),
      });

      const location = res.headers.get("location");
      await res.body?.cancel();

      if (!location || res.status < 300 || res.status >= 400) {
        break;
      }

      const next = new URL(location, currentUrl).href;
      currentUrl = next;

      const coords = mapCoordinates(currentUrl);
      if (coords) {
        resolvedCoordsCache.set(trimmed, coords);
        return coords;
      }
    }
  } catch {
    // Timeout or network error
  }

  // If redirect didn't yield coords, test final currentUrl
  const finalCoords = mapCoordinates(currentUrl);
  resolvedCoordsCache.set(trimmed, finalCoords);
  return finalCoords;
}
