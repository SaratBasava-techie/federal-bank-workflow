import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { ExcelUploadDialog } from "./ExcelUploadDialog";

// Tabs for the dashboard navigation. RAG Summary uses the root "/"
// with ?entered=true to distinguish it from the landing page.
const tabs = [
  { to: "/", search: { entered: true }, label: "RAG Summary" },
  { to: "/program", search: undefined, label: "Program Overview" },
  { to: "/joint-checklist", search: undefined, label: "Joint Workstream Checklist" },
  { to: "/risk-log", search: undefined, label: "Risk Log" },
  { to: "/decision-log", search: undefined, label: "Decision Log" },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { data: response } = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header — slides down on mount ── */}
      <header
        className="relative overflow-hidden text-white soulfire-entrance-down"
        style={{ background: "var(--gradient-header)" }}
      >
        {/* Background KPMG Watermark */}
        <img
          src="/kpmg-logo.png"
          alt=""
          className="pointer-events-none absolute right-10 top-1/2 h-56 -translate-y-1/2 opacity-5 select-none"
        />

        <div className="relative mx-auto max-w-[1400px] px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* Left Section */}
            <div className="flex-1 soulfire-entrance soulfire-delay-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Federal Bank · Credit Card Portfolio Migration
              </div>

              <h1 className="mt-1 text-4xl font-semibold tracking-tight">
                Project Soulfire - Executive Dashboard
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 soulfire-entrance soulfire-delay-2">
              <ExcelUploadDialog />
              <PoweredByKpmg />
            </div>
          </div>

          {/* Navigation & Reporting Period */}
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 soulfire-entrance soulfire-delay-3">
            <nav className="flex gap-1">
              {tabs.map((t) => {
                const active = pathname === t.to;
                return (
                  <NavTab key={t.to} to={t.to} search={t.search} label={t.label} active={active} />
                );
              })}
            </nav>

            <div className="mb-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/25">
              Reporting period:
              <span className="ml-1 font-semibold text-white">June 2026</span>
            </div>
          </div>
        </div>
      </header>

      {/* Offline banner — slides down if shown */}
      {response?.isConnected === false && (
        <div
          className="bg-destructive/15 border-b border-destructive/30 px-6 py-2.5 text-sm text-destructive-foreground soulfire-entrance-down"
          style={{ animationDuration: "400ms" }}
        >
          <div className="mx-auto max-w-[1400px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="font-semibold">Data Disconnected:</span>
              <span>
                {response?.error || "Unable to sync live data. Using offline fallback data."}
              </span>
            </div>
            <span className="text-xs opacity-75 bg-destructive/10 rounded px-2 py-0.5 font-medium select-none">
              OFFLINE FALLBACK
            </span>
          </div>
        </div>
      )}

      {/* Page content — re-animates on route change via key */}
      <main key={pathname} className="mx-auto max-w-[1400px] px-6 py-8 soulfire-page-enter">
        {children}
      </main>

      <footer className="mx-auto max-w-[1400px] px-6 pb-8 text-xs text-muted-foreground">
        Confidential · For internal programme governance use only.
      </footer>
    </div>
  );
}

// ── Animated nav tab ──────────────────────────────────────────

function NavTab({
  to,
  search,
  label,
  active,
}: {
  to: (typeof tabs)[number]["to"];
  search: { entered: true } | undefined;
  label: string;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      search={search}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", display: "inline-block" }}
      className={`rounded-t-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-background text-foreground"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}

      {/* Animated underline indicator for non-active hover */}
      {!active && (
        <span
          style={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: hovered ? "translateX(-50%) scaleX(1)" : "translateX(-50%) scaleX(0)",
            transformOrigin: "center",
            height: 1.5,
            width: "60%",
            background: "rgba(255,255,255,0.4)",
            borderRadius: 2,
            transition: "transform 0.22s cubic-bezier(0.16,1,0.3,1)",
            display: "block",
          }}
        />
      )}

      {/* Active tab animated bottom border */}
      {active && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "var(--fed-gold)",
            borderRadius: "2px 2px 0 0",
            animation: "soulfireTabSlide 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}
        />
      )}
    </Link>
  );
}

// ── Powered by KPMG badge ─────────────────────────────────────

function PoweredByKpmg() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm"
      style={{
        transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
        background: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
        borderColor: hovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)",
        transform: hovered ? "scale(1.02) translateY(-1px)" : "scale(1)",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
        Powered by
      </span>

      <img
        src="/kpmg-logo.png"
        alt="KPMG"
        className="h-5 w-auto object-contain"
        style={{
          transition: "filter 0.22s ease",
          filter: hovered ? "brightness(1.15)" : "brightness(1)",
        }}
      />
    </div>
  );
}
