import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { riskLogs as staticRiskLogs, type LogStatus } from "@/lib/dashboard-data";
import { useDashboardData } from "@/hooks/useDashboardData";

export const Route = createFileRoute("/risk-log")({
  head: () => ({
    meta: [
      { title: "Risk Log · Project Soulfire" },
      { name: "description", content: "Programme-level risk log for the Federal Bank credit card portfolio migration." },
    ],
  }),
  component: RiskLogPage,
});

function RiskLogPage() {
  const { data: response } = useDashboardData();
  const riskLogs = (response?.data?.riskLogs ?? staticRiskLogs) as { sn: number; workstream: string; detail: string; mitigation: string; raised: string; level: string; status: LogStatus }[];
  const [filter, setFilter] = useState<LogStatus | "All">("All");
  const rows = filter === "All" ? riskLogs : riskLogs.filter((r) => r.status === filter);
  const counts = riskLogs.reduce(
    (acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc),
    {} as Record<LogStatus, number>,
  );

  return (
    <DashboardShell>
      <section className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Risk Log</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Active risks tracked across workstreams with current status.
        </p>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total" value={riskLogs.length} color="#475569" />
        <StatTile label="Open" value={counts.Open ?? 0} color="#dc2626" />
        <StatTile label="WIP" value={counts.WIP ?? 0} color="#d97706" />
        <StatTile label="Closed" value={counts.Closed ?? 0} color="#16a34a" />
      </div>

      <Card>
        <CardHeader title="Risk Log" />
        <StatusFilterBar value={filter} onChange={setFilter} />
        <Table headers={["SN", "Workstream", "Issue / Risk Detail", "Date Raised", "Status"]}>
          {rows.map((r) => (
            <tr key={r.sn} className="border-t border-border/70 hover:bg-muted/40">
              <Td>{r.sn}</Td>
              <Td className="font-medium text-foreground">{r.workstream}</Td>
              <Td className="max-w-[520px] text-foreground/80">{r.detail}</Td>
              <Td className="tabular-nums whitespace-nowrap">{r.raised}</Td>
              <Td><LogStatusPill status={r.status} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </DashboardShell>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="pl-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      </div>
    </div>
  );
}

function StatusFilterBar({ value, onChange }: { value: LogStatus | "All"; onChange: (v: LogStatus | "All") => void }) {
  const opts: (LogStatus | "All")[] = ["All", "Open", "WIP", "Closed"];
  const colorFor = (o: LogStatus | "All") =>
    o === "Open" ? "#dc2626" : o === "WIP" ? "#d97706" : o === "Closed" ? "#16a34a" : "#475569";
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Filter</span>
      {opts.map((o) => {
        const active = value === o;
        const c = colorFor(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition"
            style={{ background: active ? c : "transparent", color: active ? "white" : c, borderColor: c }}
          >
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: active ? "white" : c }} />
            {o}
          </button>
        );
      })}
    </div>
  );
}

function LogStatusPill({ status }: { status: LogStatus }) {
  const color = status === "Open" ? "#dc2626" : status === "WIP" ? "#d97706" : "#16a34a";
  return (
    <span
      className="inline-flex min-w-[72px] items-center justify-center rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{ background: color }}
    >
      {status}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
      {children}
    </div>
  );
}

function CardHeader({ title }: { title: string }) {
  return (
    <div className="px-4 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--fed-navy-deep)" }}>
      {title}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {headers.map((h) => (<th key={h} className="px-4 py-2.5">{h}</th>))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-foreground/80 ${className}`}>{children}</td>;
}