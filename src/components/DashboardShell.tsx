import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import kpmgLogo from "@/assets/kpmg-logo.png.asset.json";

const tabs = [
  { to: "/", label: "RAG Summary" },
  { to: "/program", label: "Program Overview" },
  { to: "/joint-checklist", label: "Joint Workstream Checklist" },
  { to: "/risk-log", label: "Risk Log" },
  { to: "/decision-log", label: "Decision Log" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <header
        className="text-white"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="mx-auto max-w-[1400px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <KpmgMark />
                <div className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] text-white/80">
                  Reporting period:{" "}
                  <span className="font-semibold text-white">June 2026</span>
                </div>
              </div>
              <div className="hidden h-10 w-px bg-white/20 sm:block" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Federal Bank · Credit Card Portfolio Migration
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  Project Soulfire - Executive Dashboard
                </h1>
              </div>
            </div>
            <PoweredByKpmg />
          </div>
          <nav className="mt-5 flex gap-1">
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
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-6 py-8">{children}</main>
      <footer className="mx-auto max-w-[1400px] px-6 pb-8 text-xs text-muted-foreground">
        Confidential · For internal programme governance use only.
      </footer>
    </div>
  );
}

function KpmgMark() {
  return (
    <div className="flex items-center rounded-md bg-white px-3 py-2 shadow-md ring-1 ring-white/10">
      <img src={kpmgLogo.url} alt="KPMG" className="h-8 w-auto" />
    </div>
  );
}

function PoweredByKpmg() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
        Powered by
      </span>
      <span
        className="rounded-sm bg-white px-1.5 py-0.5 text-[13px] font-black leading-none tracking-tight"
        style={{ color: "#00338D", letterSpacing: "-0.02em" }}
      >
        KPMG
      </span>
    </div>
  );
}