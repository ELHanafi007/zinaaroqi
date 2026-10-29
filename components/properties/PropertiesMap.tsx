"use client";
import { useEffect, useRef, useState } from "react";
import type { PropertyDTO } from "@/types/property";
import type { FilterState } from "./FilterBar";
import { fetchProperties } from "@/lib/api-client";
import { mapCoordinates } from "@/lib/map-coordinates";
import { propertyLocationUrl } from "@/lib/property-share";
import { formatPriceWithPeriod } from "@/lib/format";
import { currencySymbol, formatCompactAmount } from "@/lib/currency";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Pin = { id: string; title: string; price: string; pinLabel: string; category: string; point: [number, number] };
export function PropertiesMap({ filters }: { filters: FilterState }) {
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<{ pins: Pin[]; total: number; status: "loading" | "ready" | "error" }>({ pins: [], total: 0, status: "loading" });
  useEffect(() => {
    let cancelled = false;
    setSelected(null);
    setState({ pins: [], total: 0, status: "loading" });
    const timer = setTimeout(async () => {
      try {
        const all: PropertyDTO[] = [];
        let page = 1, total = Infinity;
        while (all.length < total && !cancelled) {
          const result = await fetchProperties({ ...filters, status: "available", page, limit: 100 });
          total = result.total;
          if (!result.data.length) break;
          all.push(...result.data); page++;
        }
        const pins: Pin[] = [];
        let index = 0;
        const worker = async () => {
          while (!cancelled && index < all.length) {
            const property = all[index++];
            const url = propertyLocationUrl(property);
            if (!url) continue;
            let point = mapCoordinates(url);
            if (!point) {
              try { const response = await fetch(`/api/maps/resolve?url=${encodeURIComponent(url)}`); if (response.ok) point = mapCoordinates((await response.json()).embedUrl); } catch { /* Missing locations remain counted below. */ }
            }
            if (point) pins.push({ id: property._id, title: property.title, category: t(`badges.category.${property.category}`), point, pinLabel: property.price == null ? t("property.priceOnRequest") : `${formatCompactAmount(property.price, locale)} ${currencySymbol(locale)}`, price: formatPriceWithPeriod(property.price, property.listingType, property.rentalPeriod, t, locale) });
          }
        }
        await Promise.all([worker(), worker(), worker()]);
        if (!cancelled) setState({ pins, total: all.length, status: "ready" });
      } catch { if (!cancelled) setState({ pins: [], total: 0, status: "error" }); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [filters, t, locale]);
  return <section id="properties-map" className="courtyard-map"><div className="courtyard-map-heading"><h2>{t("courtyard.mapTitle")}</h2><p>{t("courtyard.mapDescription")}</p></div>
    <div className="navigator-map">
      <aside className="navigator-directory" aria-label={t("courtyard.mapDirectory")}>
        <p className="navigator-eyebrow">{t("courtyard.mapDirectory")}</p>
        <h3>{t("courtyard.mapBrowse")}</h3>
        <p className="navigator-status" role="status">{state.status === "loading" ? t("courtyard.mapLoading") : state.status === "error" ? t("courtyard.mapError") : t("courtyard.mapCount", { mapped: state.pins.length, total: state.total })}</p>
        <div className="navigator-list">{state.pins.map((pin, index) => <div key={pin.id} className={`navigator-entry ${selected === pin.id ? "is-selected" : ""}`}>
          <button type="button" aria-pressed={selected === pin.id} onClick={() => setSelected(pin.id)}>
            <span className="navigator-category">{String(index + 1).padStart(2, "0")} / {pin.category}</span>
            <strong dir="auto">{pin.title}</strong><span className="navigator-price">{pin.price}</span>
          </button><a href={`/properties/${pin.id}`}>{t("courtyard.viewProperty")} ↗</a>
        </div>)}</div>
      </aside>
      <iframe ref={frame} src={`/properties-map.html#${encodeURIComponent(JSON.stringify({ pins: state.pins, selected, label: t("courtyard.viewProperty"), error: t("courtyard.mapError"), locale }))}`} title={t("courtyard.mapTitle")} />
    </div>
    {state.status === "ready" && state.total > state.pins.length && <p className="mt-3 text-xs text-ink-400">{t("courtyard.mapMissing", { missing: state.total - state.pins.length })}</p>}
  </section>;
}
