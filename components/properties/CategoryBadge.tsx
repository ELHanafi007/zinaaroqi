"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import type { Category, PropertyDTO } from "@/types/property";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const MARK: Record<Category, IconName> = { build: "building", apartment: "home", land: "land" };

export function CategoryBadge({ category, propertyType }: { category: Category; propertyType?: PropertyDTO["propertyType"] }) {
  const { t } = useLanguage();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-700">
      <Icon name={MARK[category]} className="h-3.5 w-3.5 text-ink-500" />
      {propertyType ? t(`offer.types.${propertyType}`) : t(`badges.category.${category}`)}
    </span>
  );
}
