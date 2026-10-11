"use client";

import { Icon } from "@/components/ui/Icon";

import type { Category, ListingType, ListingStatus, ResidencyType } from "@/types/property";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export interface FilterState {
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  rooms?: string;
  location?: string;
  search: string;
  category: Category | "";
  listingType: ListingType | "";
  status: ListingStatus | "";
  residencyType: ResidencyType | "";
  sortBy: "createdAt" | "price" | "title";
  sortDir: "asc" | "desc";
}

export function FilterBar({
  value,
  onChange,
  hideCategory = false,
  hideResidencyType = false,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  hideCategory?: boolean;
  hideResidencyType?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="courtyard-filters">
      <div className="courtyard-filter-main">
      <label className="courtyard-filter-search">
        <span className="label-field">{t("filters.searchLabel")}</span>
        <div className="relative">
        <Icon name="search" className="pointer-events-none absolute start-3 top-3 h-5 w-5 text-ink-400" />
        <input
          type="search"
          placeholder={t("filters.searchPlaceholder")}
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="input-field !ps-11"
          aria-label={t("filters.searchPlaceholder")}
        />
        </div>
      </label>

      {!hideCategory && (
        <label className="min-w-0">
        <span className="label-field">{t("property.category")}</span>
<select
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value as FilterState["category"] })}
          className="input-field"
          aria-label={t("filters.allCategories")}
        >
          <option value="">{t("filters.allCategories")}</option>
          <option value="build">{t("filters.build")}</option>
          <option value="apartment">{t("filters.apartment")}</option>
          <option value="land">{t("filters.land")}</option>
        </select>
      </label>
      )}

      {value.category !== "land" && <label className="min-w-0">
        <span className="label-field">{t("filters.typeLabel")}</span>
<select
        value={value.listingType}
        onChange={(e) => onChange({ ...value, listingType: e.target.value as FilterState["listingType"] })}
        className="input-field"
        aria-label={t("filters.saleAndRent")}
      >
        <option value="">{t("filters.saleAndRent")}</option>
        <option value="sale">{t("filters.forSale")}</option>
        <option value="rent">{t("filters.forRent")}</option>
      </select>
      </label>

      }
      <label className="min-w-0">
        <span className="label-field">{t("filters.statusLabel")}</span>
<select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as FilterState["status"] })}
        className="input-field"
        aria-label={t("filters.anyStatus")}
      >
        <option value="">{t("filters.anyStatus")}</option>
        <option value="available">{t("filters.available")}</option>
        <option value="sold">{t("filters.sold")}</option>
        <option value="rented">{t("filters.rented")}</option>
      </select>
      </label>

      <label className="min-w-0">
        <span className="label-field">{t("filters.sortLabel")}</span>
<select
        value={`${value.sortBy}:${value.sortDir}`}
        onChange={(e) => {
          const [sortBy, sortDir] = e.target.value.split(":") as [FilterState["sortBy"], FilterState["sortDir"]];
          onChange({ ...value, sortBy, sortDir });
        }}
        className="input-field"
        aria-label={t("filters.sortNewest")}
      >
        <option value="createdAt:desc">{t("filters.sortNewest")}</option>
        <option value="createdAt:asc">{t("filters.sortOldest")}</option>
        <option value="price:asc">{t("filters.sortPriceLowHigh")}</option>
        <option value="price:desc">{t("filters.sortPriceHighLow")}</option>
        <option value="title:asc">{t("filters.sortTitleAZ")}</option>
      </select>
      </label>
      <details className="courtyard-filter-advanced"><summary><Icon name="filter" className="h-4 w-4" />{t("courtyard.moreFilters")}</summary><div className="courtyard-filter-options">
      {!hideResidencyType && value.category !== "land" && (
        <label className="min-w-0">
        <span className="label-field">{t("form.residencyType")}</span>
<select
          value={value.residencyType}
          onChange={(e) => onChange({ ...value, residencyType: e.target.value as FilterState["residencyType"] })}
          className="input-field"
          aria-label={t("form.residencyType")}
        >
          <option value="">{t("filters.anyResidencyType")}</option>
          <option value="family">{t("form.residencyTypeFamily")}</option>
          <option value="singles">{t("form.residencyTypeSingles")}</option>
          <option value="women_only">{t("form.residencyTypeWomenOnly")}</option>
        </select>
      </label>
      )}

      {value.category !== "land" && <>
        <label><span className="label-field">{t("offer.propertyType")}</span><select className="input-field" value={value.propertyType ?? ""} onChange={e => onChange({ ...value, propertyType: e.target.value })}><option value="">{t("courtyard.anyPropertyType")}</option>{["villa", "apartment", "duplex", "floor", "shop", "other"].map(type => <option key={type} value={type}>{t(`offer.types.${type}`)}</option>)}</select></label>
        <label><span className="label-field">{t("courtyard.minRooms")}</span><select className="input-field" value={value.rooms ?? ""} onChange={e => onChange({ ...value, rooms: e.target.value })}><option value="">{t("courtyard.anyRooms")}</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}</select></label>
      </>}
      <label><span className="label-field">{t("courtyard.minPrice")}</span><input type="number" min="0" className="input-field" value={value.minPrice ?? ""} onChange={e => onChange({ ...value, minPrice: e.target.value })} /></label>
      <label><span className="label-field">{t("courtyard.maxPrice")}</span><input type="number" min="0" className="input-field" value={value.maxPrice ?? ""} onChange={e => onChange({ ...value, maxPrice: e.target.value })} /></label>
      <label><span className="label-field">{t("courtyard.location")}</span><input className="input-field" value={value.location ?? ""} onChange={e => onChange({ ...value, location: e.target.value })} /></label>
      </div></details>

      </div>
      {(value.propertyType || value.minPrice || value.maxPrice || value.rooms || value.location || value.search || (!hideCategory && value.category) || value.listingType || value.status || (!hideResidencyType && value.residencyType) || value.sortBy !== "createdAt" || value.sortDir !== "desc") && (
        <div className="courtyard-filter-reset">
          <button type="button" className="text-sm font-semibold text-moss-600 underline-offset-4 hover:underline" onClick={() => onChange({ search: "", category: hideCategory ? value.category : "", listingType: "", status: "", residencyType: "", sortBy: "createdAt", sortDir: "desc" })}>
            {t("filters.reset")}
          </button>
        </div>
      )}
    </div>
  );
}
