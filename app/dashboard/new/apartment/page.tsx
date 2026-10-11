"use client";

import { Icon } from "@/components/ui/Icon";

import { ApartmentForm } from "@/components/forms/ApartmentForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useRequireRole } from "@/lib/auth/useRequireRole";

export default function NewApartmentPage() {
  const { t } = useLanguage();
  const { ready } = useRequireRole(["admin", "real_estate_officer"], "/dashboard/new");

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700"><Icon name="home" className="h-6 w-6" /></span>
      <p className="text-xs font-semibold uppercase tracking-widest text-brass-600">
        {t("form.newEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-800">
        {t("form.newApartmentTitle")}
      </h1>
      <p className="mt-2 text-ink-500">{t("form.newApartmentSubtitle")}</p>

      <div className="mt-8">
        <ApartmentForm />
      </div>
    </div>
  );
}
