"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaceProvider, usePace } from "@/lib/store";
import { BusinessModal } from "@/components/business-modal";
import {
  IconHome, IconMic, IconPipeline, IconTrail, IconMap, IconStats, IconExport, IconSettings, IconLogout, IconBuilding,
} from "@/components/icons";
import { logout } from "@/app/actions/auth";
import type { PaceServerData } from "@/app/actions/data";

const NAV = [
  { href: "/",         label: "Today",    icon: IconHome },
  { href: "/log",      label: "Log",      icon: IconMic },
  { href: "/pipeline",   label: "Pipeline",   icon: IconPipeline },
  { href: "/businesses", label: "Businesses", icon: IconBuilding },
  { href: "/trail",      label: "Trail",      icon: IconTrail },
  { href: "/map",      label: "Map",      icon: IconMap },
  { href: "/stats",    label: "Stats",    icon: IconStats },
  { href: "/export",   label: "Export",   icon: IconExport },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

// UI context for cross-cutting concerns (open business modal, etc.)
interface UICtx {
  openBiz: (id: string) => void;
  closeBiz: () => void;
  openBizId: string | null;
}
const UIContext = React.createContext<UICtx | null>(null);
export function useUI(): UICtx {
  const ctx = React.useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within ClientLayout");
  return ctx;
}

export function ClientLayout({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: PaceServerData;
}) {
  return (
    <PaceProvider initialData={initialData}>
      <ShellInner>{children}</ShellInner>
    </PaceProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { userName } = usePace();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Business modal state via URL searchParam ?biz=b01
  const openBizId = searchParams.get("biz");
  const openBiz = React.useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("biz", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, searchParams, router],
  );
  const closeBiz = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("biz");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, searchParams, router]);

  const uiCtx = React.useMemo(() => ({ openBiz, closeBiz, openBizId }), [openBiz, closeBiz, openBizId]);

  const initials = (userName || "?").slice(0, 2).toUpperCase();
  const viewLabel = NAV.find((n) => n.href === pathname)?.label || "Pace";

  return (
    <UIContext.Provider value={uiCtx}>
      <div className="app" data-screen-label={`Pace \u00B7 ${viewLabel}`}>
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="brand-mark">P</div>
              <span className="brand-text">Pace</span>
            </Link>
            <div className="nav-tabs">
              {NAV.map((n) => {
                const Icon = n.icon;
                const isActive = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={"nav-tab" + (isActive ? " active" : "")}
                    prefetch={true}
                  >
                    <Icon size={14} />
                    <span className="nav-tab-label">{n.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="nav-spacer" />
            <div className="nav-meta">
              <span className="muted nav-sync">Synced · just now</span>
              <span className="nav-avatar">{initials}</span>
              <button
                className="nav-tab"
                onClick={() => logout()}
                title="Sign out"
                style={{ marginLeft: 4 }}
              >
                <IconLogout size={14} />
              </button>
            </div>
          </div>
        </nav>
        <main className="main">
          {children}
        </main>
        <BusinessModal bizId={openBizId} onClose={closeBiz} />
      </div>
    </UIContext.Provider>
  );
}
