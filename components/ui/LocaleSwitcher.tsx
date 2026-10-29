"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLanguage, SUPPORTED_LOCALES } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/translations";

/** Endonyms: each language is labelled in itself, never translated. */
const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
};

/** Short badge shown on the trigger button. */
const LANGUAGE_BADGES: Record<Locale, string> = {
  en: "EN",
  ar: "ع",
  fr: "FR",
};

export function LocaleSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={LANGUAGE_NAMES[locale]}
        className="flex h-10 items-center gap-1.5 rounded-md border border-ink-200 px-2.5 text-xs font-semibold uppercase tracking-wide text-ink-600 transition hover:border-ink-400 hover:bg-stone-50"
      >
        <Icon name="globe" className="h-4 w-4" />
        <span dir="ltr">{LANGUAGE_BADGES[locale]}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-40 mt-2 w-44 overflow-hidden rounded-md border border-ink-200 bg-white py-1 shadow-lg"
        >
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              dir={code === "ar" ? "rtl" : "ltr"}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm text-ink-700 transition hover:bg-ink-50"
            >
              <span>{LANGUAGE_NAMES[code]}</span>
              {code === locale && <Icon name="check" className="h-4 w-4 text-moss-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
