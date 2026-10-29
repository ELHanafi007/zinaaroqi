"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LocationPicker } from "@/components/forms/fields/LocationPicker";
import { LAAYOUNE_NEIGHBORHOODS } from "@/lib/laayoune-data";
import type { ListingFormState } from "@/lib/forms/useListingFormState";

export function LocationFields({
  form,
  update,
  errors,
  t,
}: {
  form: ListingFormState;
  update: <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => void;
  errors: Record<string, string>;
  t: (key: string) => string;
}) {
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);

  // Set default city to Laâyoune if empty
  useEffect(() => {
    if (!form.city) {
      update("city", "Laâyoune");
    }
  }, [form.city, update]);

  // Check if current district matches a known neighborhood
  const matchedNeighborhood = LAAYOUNE_NEIGHBORHOODS.find(
    (n) =>
      n.name.toLowerCase() === (form.district || "").toLowerCase() ||
      n.nameAr === form.district
  );

  const handleNeighborhoodSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setIsCustomDistrict(true);
      return;
    }
    setIsCustomDistrict(false);
    const n = LAAYOUNE_NEIGHBORHOODS.find((item) => item.id === val);
    if (n) {
      update("district", n.name);
      if (!form.city) update("city", "Laâyoune");
      // Auto-assign coordinates URL if not already provided
      if (!form.mapUrl) {
        update("mapUrl", `https://maps.google.com/?q=${n.center[0]},${n.center[1]}`);
      }
    }
  };

  return (
    <section>
      <h3 className="flex flex-wrap items-center gap-2 font-display text-base font-semibold text-ink-800">
        <Icon name="location" className="h-5 w-5 text-moss-500" />
        {t("form.locationSection")} <span className="font-body text-xs font-normal text-ink-400">{t("form.optionalHint")}</span>
      </h3>

      <div className="mt-3">
        <label className="label-field" htmlFor="location-picker">Exact property location</label>
        <LocationPicker value={form.mapUrl} onChange={(url) => update("mapUrl", url)} />
        <p className="mt-2 text-xs text-ink-500">Click the exact point or drag the pin. The location is saved automatically with the listing.</p>
        {errors["location.mapUrl"] && <p className="field-error">{errors["location.mapUrl"]}</p>}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* City Field */}
        <div>
          <label className="label-field" htmlFor="city">{t("form.city")}</label>
          <input
            id="city"
            className="input-field"
            placeholder="Laâyoune"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
          {errors["location.city"] && <p className="field-error">{errors["location.city"]}</p>}
        </div>

        {/* Neighborhood / District Field with Dropdown + Custom */}
        <div>
          <label className="label-field" htmlFor="district">
            {t("form.district")} (Laâyoune Neighborhood)
          </label>
          {!isCustomDistrict ? (
            <div className="space-y-1.5">
              <select
                id="district-select"
                className="input-field bg-white"
                value={matchedNeighborhood?.id || (form.district ? "custom" : "")}
                onChange={handleNeighborhoodSelect}
              >
                <option value="">Select neighborhood…</option>
                {LAAYOUNE_NEIGHBORHOODS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} · {n.nameAr}
                  </option>
                ))}
                <option value="custom">Other / Custom district…</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <input
                id="district"
                className="input-field"
                placeholder="Type neighborhood name…"
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setIsCustomDistrict(false)}
                className="text-[11px] text-ink-500 hover:text-ink-800 underline"
              >
                ← Back to Laâyoune list
              </button>
            </div>
          )}
        </div>

        {/* Bloc Field (Îlot / بلوك) */}
        <div>
          <label className="label-field" htmlFor="bloc">
            Bloc (البلوك)
          </label>
          <input
            id="bloc"
            className="input-field"
            placeholder="e.g. 12, A, Bloc C…"
            value={form.bloc}
            onChange={(e) => update("bloc", e.target.value)}
          />
        </div>

        {/* Number / Lot Number Field (Numéro / الرقم) */}
        <div>
          <label className="label-field" htmlFor="number">
            Number / N° (رقم البقعة / المنزل)
          </label>
          <input
            id="number"
            className="input-field"
            placeholder="e.g. 45, Lot 110, N° 8…"
            value={form.number}
            onChange={(e) => update("number", e.target.value)}
          />
        </div>

        {/* Address / Street Field */}
        <div>
          <label className="label-field" htmlFor="address">{t("form.address")}</label>
          <input
            id="address"
            className="input-field"
            placeholder="Street name or landmark…"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
