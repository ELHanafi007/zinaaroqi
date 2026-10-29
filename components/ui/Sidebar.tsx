"use client";

import { Icon, type IconName } from "./Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { UserRole } from "@/types/user";

const LISTINGS_ROLES: UserRole[] = ["admin", "real_estate_officer", "project_manager"];
const ORDERS_ROLES: UserRole[] = ["admin", "sales_officer"];

function roleLabelKey(role: UserRole): string {
  switch (role) {
    case "admin":
      return "users.roleAdmin";
    case "real_estate_officer":
      return "users.roleRealEstateOfficer";
    case "sales_officer":
      return "users.roleSalesOfficer";
    case "project_manager":
      return "users.roleProjectManager";
    default:
      // Defensive fallback: a session issued before a role rename (or any
      // other unrecognized value) should never crash the page — just show
      // something sensible until the user signs in again with a fresh role.
      return "users.roleUnknown";
  }
}

interface NavItem {
  href: string;
  labelKey: string;
  mark: IconName;
}

const BROWSE_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.allListings", mark: "grid" },
  { href: "/apartments", labelKey: "nav.apartments", mark: "home" },
  { href: "/builds", labelKey: "nav.builds", mark: "building" },
  { href: "/lands", labelKey: "nav.lands", mark: "land" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/dashboard") {
    // Avoid double-highlighting Dashboard when a more specific admin route
    // (like /dashboard/orders) has its own nav entry.
    return (
      pathname === "/dashboard" ||
      (pathname.startsWith("/dashboard/") &&
        !pathname.startsWith("/dashboard/map") &&
        !pathname.startsWith("/dashboard/orders") &&
        !pathname.startsWith("/dashboard/users") &&
        !pathname.startsWith("/dashboard/whatsapp"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const { t } = useLanguage();
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
        active
          ? "bg-ink-800 text-stone-50"
          : "text-ink-600 hover:bg-ink-50 hover:text-ink-800",
      ].join(" ")}
    >
      <Icon name={item.mark} className={`h-5 w-5 ${active ? "text-brass-100" : "text-ink-400"}`} />
      {t(item.labelKey)}
    </Link>
  );
}

export function SidebarNav({
  onNavigate,
  onToggleCollapse,
  isCollapsed = false,
}: {
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const role = session?.user.role;
  const adminItems: NavItem[] = [];
  if (role && LISTINGS_ROLES.includes(role)) {
    adminItems.push({ href: "/dashboard", labelKey: "nav.dashboard", mark: "grid" });
    adminItems.push({ href: "/dashboard/map", labelKey: "nav.mapExplorer", mark: "location" });
  }
  if (role && ORDERS_ROLES.includes(role)) {
    adminItems.push({ href: "/dashboard/orders", labelKey: "nav.orders", mark: "clipboard" });
  }
  if (role === "admin") {
    adminItems.push({ href: "/dashboard/users", labelKey: "nav.users", mark: "users" });
    adminItems.push({ href: "/dashboard/whatsapp", labelKey: "whatsappConnection.title", mark: "phone" });
  }

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-5">
      {/* Top Sidebar Header with Collapse Button */}
      {onToggleCollapse && (
        <div className="flex items-center justify-between border-b border-ink-100/80 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-moss-50 text-moss-600 shadow-sm">
              <Icon name="grid" className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-700">
              {t("nav.sidebarTitle")}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!isCollapsed}
            className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200/80 bg-stone-50 text-ink-600 shadow-sm transition-all duration-200 hover:border-moss-500 hover:bg-moss-50 hover:text-moss-700 active:scale-90 focus-visible:ring-2 focus-visible:ring-moss-500 focus-visible:ring-offset-1"
            title={`${t("nav.collapseSidebar")} (⌘B)`}
            aria-label={t("nav.collapseSidebar")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:scale-105"
            >
              <rect x="3" y="3" width="18" height="18" rx="2.5" ry="2.5" />
              <line x1="9" y1="3" x2="9" y2="21" className="stroke-moss-600 transition-colors group-hover:stroke-moss-700" />
              {/* Animated chevron arrow indicating collapse direction */}
              <path
                d="m15 9-3 3 3 3"
                className="transition-transform duration-200 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
              />
            </svg>

            {/* Hover Tooltip */}
            <span className="pointer-events-none absolute -bottom-8 end-0 z-50 whitespace-nowrap rounded-md bg-ink-900 px-2 py-0.5 text-[10px] font-medium text-stone-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              {t("nav.collapseSidebar")} <kbd className="font-mono text-[9px] text-ink-300">⌘B</kbd>
            </span>
          </button>
        </div>
      )}

      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-500">
          {t("nav.browseSection")}
        </p>
        <div className="space-y-1">
          {BROWSE_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      {status === "authenticated" && adminItems.length > 0 && (
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-500">
            {t("nav.adminSection")}
          </p>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto space-y-3">
        {status === "authenticated" ? (
          <>
            {role && LISTINGS_ROLES.includes(role) && (
              <Link href="/dashboard/new" onClick={onNavigate} className="btn-primary w-full justify-center">
                {t("nav.addListing")}
              </Link>
            )}
            <div className="flex items-center justify-between gap-2 rounded-md border border-ink-100 bg-stone-50 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink-700">{session.user.name}</p>
                <p className="truncate text-[11px] text-ink-400">
                  {role ? t(roleLabelKey(role)) : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex-shrink-0 text-xs font-semibold text-rust-500 hover:underline"
              >
                {t("auth.signOut")}
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="btn-secondary w-full justify-center"
          >
            {t("auth.staffSignIn")}
          </Link>
        )}
      </div>
    </nav>
  );
}
