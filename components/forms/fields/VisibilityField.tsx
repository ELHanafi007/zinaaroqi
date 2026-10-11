"use client";

import type { ListingFormState } from "@/lib/forms/useListingFormState";
import { SegmentedControl } from "./ListingControls";

export function VisibilityField({
  form,
  update,
  t,
}: {
  form: ListingFormState;
  update: <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <SegmentedControl
        name="visibility"
        label={t("form.visibility")}
        value={form.visibility}
        options={[
          { value: "public", label: t("form.visibilityPublic") },
          { value: "private", label: t("form.visibilityPrivate") },
        ]}
        onChange={(value) => update("visibility", value)}
      />
      <p className="mt-1.5 text-xs text-ink-400">
        {form.visibility === "public" ? t("form.visibilityPublicNote") : t("form.visibilityPrivateNote")}
      </p>
    </div>
  );
}
