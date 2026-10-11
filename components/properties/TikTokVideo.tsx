"use client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function TikTokVideo({ url }: { url: string }) {
  const { t } = useLanguage();
  let videoId: string | null = null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && (parsed.hostname === "tiktok.com" || parsed.hostname.endsWith(".tiktok.com"))) videoId = parsed.pathname.match(/\/video\/(\d+)/)?.[1] || null;
  } catch { return null; }
  if (!videoId) return null;
  return <iframe src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=0`} title={t("property.watchOnTikTok")} className="mx-auto h-[560px] w-full max-w-[360px] rounded-xl border-0" loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen />;
}
