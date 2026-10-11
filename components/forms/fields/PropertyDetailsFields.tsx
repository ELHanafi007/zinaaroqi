"use client";

import { Icon } from "@/components/ui/Icon";

import { ResidencyField, Toggle } from "./ListingControls";
import type { ListingFormState } from "@/lib/forms/useListingFormState";

export function PropertyDetailsFields({
  form,
  update,
  t,
  errors,
}: {
  form: ListingFormState;
  update: <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => void;
  t: (key: string) => string;
  errors: Record<string, string>;
}) {
  return (
    <section>
      <h3 className="flex flex-wrap items-center gap-2 font-display text-base font-semibold text-ink-800"><Icon name="home" className="h-5 w-5 text-moss-500" />{t("form.detailsSection")}</h3>
      <p className="mt-1 text-sm text-ink-400">{t("form.detailsHint")}</p>
      <div className="mt-3"><Toggle checked={form.hasDetails} onChange={(checked) => update("hasDetails", checked)} label={t("form.hasDetails")} /></div>
      {form.hasDetails && <>
      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label-field" htmlFor="rooms">{t("form.rooms")}</label>
          <input
            id="rooms"
            type="number"
            min={0}
            className="input-field"
            value={form.rooms}
            onChange={(e) => update("rooms", e.target.value)}
            step={1}
          />
          {errors["details.rooms"] && <p className="field-error">{errors["details.rooms"]}</p>}
        </div>
        <div>
          <label className="label-field" htmlFor="bathrooms">{t("form.bathrooms")}</label>
          <input
            id="bathrooms"
            type="number"
            min={0}
            className="input-field"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
            step={1}
          />
          {errors["details.bathrooms"] && <p className="field-error">{errors["details.bathrooms"]}</p>}
        </div>
        <Toggle checked={form.hasKitchen} onChange={(checked) => update("hasKitchen", checked)} label={t("form.hasKitchen")} />
        <Toggle checked={form.kitchenCabinetsInstalled} onChange={(checked) => update("kitchenCabinetsInstalled", checked)} label={t("form.kitchenCabinetsInstalled")} />
      </div>

      <div className="mt-4"><Toggle checked={form.acInstalled} onChange={(checked) => update("acInstalled", checked)} label={t("form.acInstalled")} /></div>
      <div className="mt-4">
        <ResidencyField value={form.residencyType} onChange={(value) => update("residencyType", value)} t={t} />
        <p className="mt-1.5 text-xs text-ink-400">{t("form.residencyTypeHint")}</p>
      </div>
      </>}
    </section>
  );
}
