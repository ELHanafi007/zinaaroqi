import { NextRequest, NextResponse } from "next/server";
import { googleMapEmbedUrl, isGoogleMapsUrl } from "@/lib/maps";

export async function GET(request: NextRequest) {
  let url = request.nextUrl.searchParams.get("url") ?? "";
  if (!isGoogleMapsUrl(url) || url.length > 4096) return NextResponse.json({ error: "Invalid Google Maps URL." }, { status: 400 });
  try {
    for (let redirects = 0; redirects < 5; redirects++) {
      const embedUrl = googleMapEmbedUrl(url);
      if (embedUrl) return NextResponse.json({ embedUrl });
      // Resolve only Google-owned Maps links, checking every redirect before fetching.
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(5000) });
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || response.status < 300 || response.status >= 400) break;
      const next = new URL(location, url).href;
      if (!isGoogleMapsUrl(next)) break;
      url = next;
    }
  } catch { /* The client shows an actionable fallback when a link cannot resolve. */ }
  return NextResponse.json({ error: "Use the full Google Maps location URL." }, { status: 422 });
}
