import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useDashboardData } from "../hooks/useDashboardData";

const tabs = [
  { to: "/", label: "RAG Summary" },
  { to: "/program", label: "Program Overview" },
  { to: "/joint-checklist", label: "Joint Workstream Checklist" },
  { to: "/risk-log", label: "Risk Log" },
  { to: "/decision-log", label: "Decision Log" },
];

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const { data: response } = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <header
        className="relative overflow-hidden text-white"
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
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Federal Bank · Credit Card Portfolio Migration
              </div>

              <h1 className="mt-1 text-4xl font-semibold tracking-tight">
                Project Soulfire - Executive Dashboard
              </h1>
            </div>

            {/* Right Section */}
            <PoweredByKpmg />
          </div>

          {/* Navigation & Reporting Period */}
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <nav className="flex gap-1">
              {tabs.map((t) => {
                const active = pathname === t.to;

                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-background text-foreground"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mb-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-sm">
              Reporting period:
              <span className="ml-1 font-semibold text-white">
                June 2026
              </span>
            </div>
          </div>
        </div>
      </header>

      {response?.isConnected === false && (
        <div className="bg-destructive/15 border-b border-destructive/30 px-6 py-2.5 text-sm text-destructive-foreground">
          <div className="mx-auto max-w-[1400px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="font-semibold">Data Disconnected:</span>
              <span>{response?.error || "Unable to sync live data. Using offline fallback data."}</span>
            </div>
            <span className="text-xs opacity-75 bg-destructive/10 rounded px-2 py-0.5 font-medium select-none">
              OFFLINE FALLBACK
            </span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {children}
      </main>

      <footer className="mx-auto max-w-[1400px] px-6 pb-8 text-xs text-muted-foreground">
        Confidential · For internal programme governance use only.
      </footer>
    </div>
  );
}

function PoweredByKpmg() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
        Powered by
      </span>

      <img
        src="/kpmg-logo.png"
        alt="KPMG"
        className="h-5 w-auto object-contain"
      />
    </div>
  );
}
