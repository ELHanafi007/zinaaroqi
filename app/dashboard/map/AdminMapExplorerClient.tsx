"use client";

import { useRequireRole } from "@/lib/auth/useRequireRole";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const MAP_TOKEN = process.env.NEXT_PUBLIC_ADMIN_MAP_TOKEN || "";

export default function AdminMapExplorerClient() {
  const { ready } = useRequireRole(["admin", "real_estate_officer", "project_manager"], "/login");

  if (!ready) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#faf9f6] text-ink-700">
        <p className="text-sm font-medium">جارٍ التحقق من الصلاحيات…</p>
      </div>
    );
  }

  const iframeSrc = `/dreamx-map.html?token=${encodeURIComponent(MAP_TOKEN)}`;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-[#faf9f6]">
      {/* Clean Minimal Header Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e5e3db] bg-white px-4 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold tracking-wider text-[#b38844] font-display">زين الرقي — خريطة العقارات</span>
          <span className="text-[#94a3b8]">·</span>
          <span className="font-medium text-ink-700">العيون (Laâyoune)</span>
          <span className="rounded-full bg-[#1e3d2f]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#1e3d2f]">
            إجمالي المخزون
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1e3d2f] px-3.5 py-1 text-xs font-semibold text-white transition hover:bg-[#28523f] shadow-sm"
          >
            <Icon name="tag" className="h-3.5 w-3.5" />
            <span>إضافة عقار</span>
          </Link>
          <a
            href={iframeSrc}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-ink-500 hover:text-ink-900 transition font-medium"
          >
            <span>فتح بشاشة كاملة</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* Embedded Map */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#faf9f6]">
        <iframe
          src={iframeSrc}
          title="زين الرقي — خريطة العقارات في العيون"
          className="h-full w-full border-0"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
