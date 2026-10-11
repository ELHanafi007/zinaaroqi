"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { googleMapEmbedUrl, isGoogleMapsUrl } from "@/lib/maps";

export function LocationMap({ url }: { url: string }) {
  const { t } = useLanguage();
  const [resolved, setResolved] = useState<{ url: string; embedUrl: string | null } | null>(null);
  const direct = googleMapEmbedUrl(url);
  const valid = isGoogleMapsUrl(url);
  const embedUrl = direct ?? (resolved?.url === url ? resolved.embedUrl : null);
  useEffect(() => {
    if (!valid || direct) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/maps/resolve?url=${encodeURIComponent(url)}`, { signal: controller.signal });
        const result = await response.json();
        if (!controller.signal.aborted) setResolved({ url, embedUrl: response.ok ? result.embedUrl : null });
      } catch { if (!controller.signal.aborted) setResolved({ url, embedUrl: null }); }
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [url, valid, direct]);
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-ink-100 bg-stone-50">
      {embedUrl ? <iframe src={embedUrl} title={t("form.locationSection")} className="h-72 w-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" /> :
        <p role="status" className="p-4 text-sm text-ink-500">{valid && resolved?.url !== url ? t("form.mapLoading") : t("form.mapUnavailable")}</p>}
      {valid && <a href={url} target="_blank" rel="noopener noreferrer" className="block border-t border-ink-100 px-4 py-3 text-sm font-semibold text-moss-600 hover:underline">{t("form.openMap")} ↗</a>}
    </div>
  );
}
