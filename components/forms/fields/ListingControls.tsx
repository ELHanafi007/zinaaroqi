"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { PriceInput } from "./PriceInput";
import type { ResidencyType } from "@/types/property";
import { statusOptionsFor } from "@/types/property";
import type { ListingFormState } from "@/lib/forms/useListingFormState";

type Props = {
  form: ListingFormState;
  update: <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => void;
  t: (key: string) => string;
};

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm font-medium text-ink-700">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-ink-200 transition peer-checked:bg-moss-500 peer-focus-visible:ring-2 peer-focus-visible:ring-moss-500 peer-focus-visible:ring-offset-2">
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "start-[22px]" : "start-0.5"}`} />
      </span>
    </label>
  );
}

export function SegmentedControl<T extends string>({ name, label, value, options, onChange, required = false }: {
  name: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  required?: boolean;
}) {
  const icons: Record<string, IconName> = { listingType: "tag", status: "check", visibility: "globe", rentalPeriod: "calendar", residencyType: "users", hasPrice: "money" };
  const icon = icons[name] ?? (name.startsWith("unit-residency") ? "users" : undefined);
  return (
    <fieldset>
      <legend className="label-field"><span className="inline-flex items-center gap-2">{icon && <Icon name={icon} className="h-4 w-4" />}{label}</span></legend>
      <div className={`grid grid-cols-2 gap-1 rounded-xl border border-ink-100 bg-stone-100 p-1 ${options.length > 2 ? "sm:grid-cols-4" : ""}`}>
        {options.map((option) => (
          <label key={option.value} className={`relative cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${value === option.value ? "bg-ink-800 text-white shadow-sm" : "text-ink-500 hover:bg-white"}`}>
            <input type="radio" required={required} name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="peer sr-only" />
            <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-4">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ListingTypeField({ form, update, t }: Props) {
  return <SegmentedControl name="listingType" label={t("form.listingType")} value={form.listingType}
    options={[{ value: "sale", label: t("form.listingTypeSale") }, { value: "rent", label: t("form.listingTypeRent") }]}
    onChange={(value) => update("listingType", value)} />;
}

export function AvailabilityField({ form, update, t, errors }: Props & { errors: Record<string, string> }) {
  return (
    <div>
      <SegmentedControl name="status" label={t("form.availability")} value={form.status}
        options={statusOptionsFor(form.listingType).map((value) => ({ value, label: t(`badges.status.${value}`) }))}
        onChange={(value) => update("status", value)} />
      <p className="mt-1.5 text-xs text-ink-400">
        {form.listingType === "sale" ? t("form.availabilityNoteSale") : t("form.availabilityNoteRent")}
      </p>
      {errors.status && <p className="field-error">{errors.status}</p>}
    </div>
  );
}

export function RentalPeriodField({ form, update, t, errors }: Props & { errors: Record<string, string> }) {
  return (
    <div>
      <SegmentedControl name="rentalPeriod" label={t("form.rentalPeriod")} value={form.rentalPeriod} required
        options={[{ value: "monthly", label: t("form.monthly") }, { value: "yearly", label: t("form.yearly") }]}
        onChange={(value) => update("rentalPeriod", value)} />
      {errors.rentalPeriod && <p className="field-error">{errors.rentalPeriod}</p>}
    </div>
  );
}

export function ResidencyField({ name = "residencyType", value, onChange, t }: {
  name?: string;
  value: ResidencyType | "";
  onChange: (value: ResidencyType | "") => void;
  t: (key: string) => string;
}) {
  return <SegmentedControl name={name} label={t("form.residencyType")} value={value}
    options={[
      { value: "", label: t("form.residencyTypeAny") },
      { value: "family", label: t("form.residencyTypeFamily") },
      { value: "singles", label: t("form.residencyTypeSingles") },
      { value: "women_only", label: t("form.residencyTypeWomenOnly") },
    ]}
    onChange={onChange} />;
}

export function PriceField({ form, update, errors, t }: Props & { errors: Record<string, string> }) {
  return (
    <div className="space-y-3">
      <SegmentedControl
        name="hasPrice"
        label={t("form.hasPrice")}
        value={form.hasPrice ? "yes" : "no"}
        options={[
          { value: "yes", label: t("property.hasKitchenYes") },
          { value: "no", label: t("property.hasKitchenNo") },
        ]}
        onChange={(value) => update("hasPrice", value === "yes")}
      />
      {form.hasPrice && <div>
        <label className="label-field" htmlFor="price">{t("form.price")}</label>
        <PriceInput value={form.price} onChange={(value) => update("price", value)} currency={t("common.currency")} />
        {errors.price && <p className="field-error">{errors.price}</p>}
      </div>}
    </div>
  );
}
