"use client";

import { Children, useEffect, useRef, type ReactNode, type FormEvent } from "react";
import type { ListingFormState } from "@/lib/forms/useListingFormState";
import type { Category } from "@/types/property";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Icon } from "@/components/ui/Icon";
import { formatPriceWithPeriod } from "@/lib/format";

export function EditorialListingForm({ children, form, category, errors, submitError, submitting, isEdit, onSubmit, onCancel }: {
  children: ReactNode; form: ListingFormState; category: Category; errors: Record<string, string>;
  submitError: string | null; submitting: boolean; isEdit: boolean;
  onSubmit: (event: FormEvent) => void; onCancel: () => void;
}) {
  const { t } = useLanguage();
  const root = useRef<HTMLFormElement>(null);
  const panels = Children.toArray(children);
  const labels = [t("guided.essentials"), category === "build" ? t("guided.apartments") : t("guided.details"), t("guided.locationOwner"), t("guided.media"), t("guided.review")];
  const price = formatPriceWithPeriod(form.hasPrice && form.price ? Number(form.price.replace(/,/g, "")) : undefined, form.listingType, form.rentalPeriod || undefined, t);

  useEffect(() => {
    const firstError = root.current?.querySelector<HTMLElement>(".field-error");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors]);

  return <form ref={root} className="guided-listing editorial-listing listing-form" onSubmit={onSubmit}>
    <div className="guided-main">
      {submitError && <div role="alert" className="mb-5 rounded-lg border border-rust-500/30 bg-rust-50 p-4 text-sm text-rust-600">{submitError}</div>}
      {panels.map((panel, index) => <section key={index} data-guided-step={index} className="guided-panel"><header><p>0{index + 1}</p><h2>{labels[index]}</h2></header><div className="space-y-8">{panel}</div></section>)}
      <div className="guided-actions"><button type="button" className="btn-secondary" disabled={submitting} onClick={onCancel}>{t("form.cancel")}</button><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? t("form.saving") : isEdit ? t("form.saveChanges") : t("form.createListing")}</button></div>
    </div>
    <aside className="guided-summary"><p className="guided-summary-label">{t("guided.snapshot")}</p><div className="guided-illustration"><Icon name={category === "build" ? "building" : category === "land" ? "land" : "home"} className="h-16 w-16" /></div><h3>{form.title || t("guided.untitled")}</h3><p className="mt-2 text-xs text-slate-500">{category === "apartment" ? t(`offer.types.${form.propertyType}`) : t(`badges.category.${category}`)} · {t(`badges.listingType.${form.listingType}`)}</p><hr /><strong>{price}</strong><dl><div><dt>{t("property.availability")}</dt><dd>{t(`badges.status.${form.status}`)}</dd></div><div><dt>{t("form.visibility")}</dt><dd>{t(form.visibility === "public" ? "form.visibilityPublic" : "form.visibilityPrivate")}</dd></div>{category === "build" && <div><dt>{t("guided.apartments")}</dt><dd>{form.units.length}</dd></div>}</dl></aside>
  </form>;
}
