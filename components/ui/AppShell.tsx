"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SidebarNav } from "./Sidebar";
import { SiteHeader } from "./SiteHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const content = contentRef.current;
    content?.setAttribute("inert", "");
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? []);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => {
      content?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      previousFocus?.focus();
    };
  }, [mobileOpen]);

  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);

  // Restore sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dreamx_sidebar_hidden");
      if (saved !== null) {
        setDesktopSidebarHidden(saved === "true");
      }
    } catch {
      // localStorage may be disabled
    }
  }, []);

  const toggleDesktopSidebar = () => {
    setDesktopSidebarHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dreamx_sidebar_hidden", String(next));
      } catch {}
      return next;
    });
  };

  // Global keyboard shortcut (Cmd+B or Ctrl+B) to toggle sidebar anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleDesktopSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close the mobile drawer automatically whenever navigation happens.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="soft-sage-shell relative flex min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3">{t("nav.skipContent")}</a>

      {/* Desktop Sidebar with GPU-accelerated spring slide and width morph */}
      <aside
        className={`sage-sidebar hidden flex-shrink-0 border-e transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:block overflow-hidden ${
          desktopSidebarHidden
            ? "w-0 border-transparent opacity-0 pointer-events-none"
            : "w-64 border-ink-100 opacity-100"
        }`}
        aria-hidden={desktopSidebarHidden}
      >
        <div
          className={`sticky top-0 h-screen w-64 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            desktopSidebarHidden
              ? "-translate-x-full rtl:translate-x-full"
              : "translate-x-0"
          }`}
        >
          <SidebarNav
            onToggleCollapse={toggleDesktopSidebar}
            isCollapsed={desktopSidebarHidden}
          />
        </div>
      </aside>

      {/* World-Tier Floating Edge Handle on the Sidebar Boundary */}
      <div
        className="fixed top-24 z-40 hidden md:block transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          insetInlineStart: desktopSidebarHidden ? "0px" : "15.75rem",
        }}
      >
        <button
          type="button"
          onClick={toggleDesktopSidebar}
          className={`group relative flex h-11 w-6 items-center justify-center border border-ink-200/90 bg-stone-50/95 text-ink-600 shadow-md backdrop-blur-sm transition-all duration-200 hover:w-7 hover:border-moss-500 hover:bg-white hover:text-moss-700 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 ${
            desktopSidebarHidden
              ? "rounded-e-xl border-s-0 shadow-lg"
              : "rounded-full shadow-sm"
          }`}
          title={desktopSidebarHidden ? `${t("nav.expandSidebar")} (⌘B)` : `${t("nav.collapseSidebar")} (⌘B)`}
          aria-label={desktopSidebarHidden ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${
              desktopSidebarHidden
                ? "rotate-0 rtl:rotate-180 group-hover:scale-110"
                : "rotate-180 rtl:rotate-0 group-hover:scale-110"
            }`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>

          {/* Floating Tooltip Pill */}
          <span className="pointer-events-none absolute -bottom-8 start-0 z-50 whitespace-nowrap rounded-md bg-ink-900 px-2 py-0.5 text-[10px] font-medium text-stone-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            {desktopSidebarHidden ? t("nav.expandSidebar") : t("nav.collapseSidebar")}{" "}
            <kbd className="font-mono text-[9px] text-ink-300">⌘B</kbd>
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label={t("nav.browseSection")} className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <button type="button" onClick={() => setMobileOpen(false)} className="m-4 mb-0 self-end rounded-lg border border-ink-100 px-3 py-2 text-sm font-semibold">{t("nav.closeMenu")}</button>
            <div className="min-h-0 flex-1"><SidebarNav onNavigate={() => setMobileOpen(false)} /></div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300" ref={contentRef}>
        <SiteHeader onMenuClick={() => setMobileOpen(true)} />
        <main id="main-content" tabIndex={-1} className={`min-h-[calc(100vh-64px)] flex-1 ${/^\/properties\/[^/]+\/?$/.test(pathname) ? "editorial-page-background" : ["/", "/apartments", "/builds", "/lands"].includes(pathname) ? "courtyard-page-background" : ""}`}>{children}</main>
      </div>
    </div>
  );
}
