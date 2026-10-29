"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { PropertiesMap } from "./PropertiesMap";
import { Icon } from "@/components/ui/Icon";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { FilterBar, type FilterState } from "@/components/properties/FilterBar";
import { LoadingGrid } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchProperties } from "@/lib/api-client";
import type { Category, PropertyDTO } from "@/types/property";
import type { UserRole } from "@/types/user";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Image from "next/image";

const LISTINGS_ROLES: UserRole[] = ["admin", "real_estate_officer", "project_manager"];

/**
 * Shared browse/filter/grid view. When `fixedCategory` is provided (used by
 * the dedicated /apartments, /builds, /lands pages), the category filter is
 * locked and hidden from the FilterBar rather than duplicating this whole
 * page three times.
 */
export function ListingsBrowser({
  fixedCategory,
  eyebrowKey,
  titleKey,
  subtitleKey,
}: {
  fixedCategory?: Category;
  eyebrowKey: string;
  titleKey: string;
  subtitleKey: string;
}) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const canAddListing = Boolean(session?.user.role && LISTINGS_ROLES.includes(session.user.role));
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: fixedCategory ?? "",
    listingType: "",
    legalStatus: "",
    status: "available",
    residencyType: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [page, setPage] = useState(1);
  const results = useRef<HTMLDivElement>(null);
  const pageSize = 12;
  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  const requestId = useRef(0);

  const load = useCallback(async (f: FilterState) => {
    const id = ++requestId.current;
    setStatus("loading");
    try {
      const res = await fetchProperties({ ...f, category: fixedCategory ?? f.category, limit: pageSize, page });
      if (id !== requestId.current) return;
      setProperties(res.data);
      setTotal(res.total);
      setStatus("ready");
    } catch {
      if (id === requestId.current) setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedCategory, page]);

  useEffect(() => {
    requestId.current += 1;
    const timeout = setTimeout(() => load(filters), 250);
    return () => { clearTimeout(timeout); requestId.current += 1; };
  }, [filters, load]);

  return (
    <div className="courtyard-browser mx-auto max-w-[1440px] px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
      <div className="courtyard-hero">
        <div><p className="courtyard-eyebrow">
          {t(eyebrowKey)}
        </p>
        <h1 className="courtyard-title">
          {t(titleKey)}
        </h1>
        <p className="courtyard-description">{t(subtitleKey)}</p><a href="#properties-map" className="courtyard-map-link">{t("courtyard.mapLink")} ↓</a></div>
        <div className="courtyard-hero-art" aria-hidden="true"><Image src="/sunlit-coastal-desert-villa.png" alt="" fill priority unoptimized sizes="(max-width: 760px) 100vw, 42vw" className="object-cover object-[58%_center]" /><span><Icon name={fixedCategory === "land" ? "land" : fixedCategory === "build" ? "building" : "home"} className="h-5 w-5" />{t("courtyard.snapshot")}</span></div>
      </div>

      <div className="mb-8">
        <FilterBar
          value={filters}
          onChange={next => {
            setPage(1);
            setFilters(next.category === "land" ? { ...next, listingType: "", legalStatus: next.legalStatus, residencyType: "", propertyType: "", rooms: "" } : { ...next, legalStatus: "" });
          }}
          hideCategory={Boolean(fixedCategory)}
          hideResidencyType={fixedCategory === "land" || !session?.user}
        />
      </div>

      <div ref={results} className="scroll-mt-6">
      {status === "loading" && <LoadingGrid count={6} />}

      {status === "error" && <ErrorState onRetry={() => load(filters)} />}

      {status === "ready" && properties.length === 0 && (
        <EmptyState
          title={t("browse.emptyTitle")}
          description={t("browse.emptyDesc")}
          actionLabel={canAddListing ? t("browse.addListingCta") : undefined}
          actionHref={canAddListing ? "/dashboard/new" : undefined}
        />
      )}

      {status === "ready" && properties.length > 0 && (
        <>
          <p role="status" className="mb-5 text-sm font-medium text-ink-500">{t("browse.resultsCount", { count: total })}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        </>
      )}
      {status === "ready" && total > pageSize && <nav className="courtyard-pagination" aria-label={t("courtyard.pagination")}><button type="button" disabled={page === 1} onClick={() => { setPage(page - 1); results.current?.scrollIntoView({ behavior: "smooth" }); }}>{t("courtyard.previous")}</button>{Array.from({ length: Math.ceil(total / pageSize) }, (_, index) => index + 1).filter(n => n === 1 || n === Math.ceil(total / pageSize) || Math.abs(n - page) <= 1).map((n, index, nums) => <span key={n}>{index > 0 && n - nums[index - 1] > 1 && <span className="px-2">…</span>}<button type="button" aria-current={page === n ? "page" : undefined} aria-label={t("courtyard.page", { page: n, pages: Math.ceil(total / pageSize) })} onClick={() => { setPage(n); results.current?.scrollIntoView({ behavior: "smooth" }); }}>{n}</button></span>)}<button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => { setPage(page + 1); results.current?.scrollIntoView({ behavior: "smooth" }); }}>{t("courtyard.next")}</button></nav>}
      </div>
      <PropertiesMap filters={filters} />
    </div>
  );
}
