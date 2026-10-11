"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatPrice, normalizePriceInput } from "@/lib/format";

export function PriceInput({ value, onChange, currency }: { value: string; onChange: (value: string) => void; currency: string }) {
  const [focused, setFocused] = useState(false);
  const formatted = value && Number.isFinite(Number(value)) ? formatPrice(Number(value)) : value;
  return (
    <div className="relative" dir="ltr">
      <Icon name="money" className="pointer-events-none absolute start-3 top-3 h-5 w-5 text-ink-400" />
      <input id="price" type="text" inputMode="decimal" autoComplete="off" dir="ltr" className="input-field !ps-11 !pe-16 text-start tabular-nums" value={focused ? value : formatted}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={(event) => { const next = normalizePriceInput(event.target.value); if (next !== null) onChange(next); }} required />
      <span className="pointer-events-none absolute end-3 top-3.5 text-xs font-semibold text-ink-500">{currency}</span>
    </div>
  );
}
