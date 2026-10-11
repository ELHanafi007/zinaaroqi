import { isGoogleMapsUrl } from "./maps";

export function mapCoordinates(value: string): [number, number] | null {
  if (!isGoogleMapsUrl(value)) return null;
  try {
    const url = new URL(value);
    const decoded = decodeURIComponent(url.pathname + url.search);
    const marker = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    const query = (url.searchParams.get("q") || url.searchParams.get("query") || "").match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    const match = marker || query;
    if (!match) return null;
    const point: [number, number] = [Number(match[1]), Number(match[2])];
    return Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180 ? point : null;
  } catch { return null; }
}
