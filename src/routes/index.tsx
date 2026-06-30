import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import {
  ragSummary,
  pendingFromTsys,
  riskLogs,
  decisionLogs,
  type LogStatus,
  type RagStatus,
} from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RAG Summary · Federal Bank Programme" },
      { name: "description", content: "RAG status summary for the Standard Chartered to Federal Bank credit card portfolio migration." },
      { property: "og:title", content: "RAG Summary · Federal Bank Programme" },
      { property: "og:description", content: "RAG status summary for the Standard Chartered to Federal Bank credit card portfolio migration." },
    ],
  }),
  component: Index,
});

function Index() {
  const counts = ragSummary.reduce(
    (acc, r) => ((acc[r.rag] = (acc[r.rag] ?? 0) + 1), acc),
    {} as Record<RagStatus, number>,
  );

  const [riskFilter, setRiskFilter] = useState<LogStatus | "All">("All");
  const [decisionFilter, setDecisionFilter] = useState<LogStatus | "All">("All");
  const filteredRisks = riskFilter === "All" ? riskLogs : riskLogs.filter((r) => r.status === riskFilter);
  const filteredDecisions = decisionFilter === "All" ? decisionLogs : decisionLogs.filter((r) => r.status === decisionFilter);

  return (
    <DashboardShell>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            RAG Summary Dashboard — June&nbsp;2026
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open risks, blockers and dependencies tracked across workstreams.
          </p>
        </div>
        <Legend />
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Open items" value={ragSummary.length} tone="info" />
        <StatTile label="Critical" value={counts.critical ?? 0} tone="critical" />
        <StatTile label="Possible delay" value={counts.warning ?? 0} tone="warning" />
      </div>

      <Card>
        <CardHeader title="Open RAG items" />
        <Table
          headers={["SN", "Workstream", "Activity", "Owner", "Leads", "Date Raised", "Target Date", "RAG"]}
        >
          {ragSummary.map((r) => (
            <tr key={r.sn} className="border-t border-border/70 hover:bg-muted/40">
              <Td>{r.sn}</Td>
              <Td className="font-medium text-foreground">{r.workstream}</Td>
              <Td className="max-w-[420px] text-foreground/80">{r.activity}</Td>
              <Td>{r.owner}</Td>
              <Td>{r.leads}</Td>
              <Td className="tabular-nums">{r.dateRaised}</Td>
              <Td className="tabular-nums">{r.targetDate}</Td>
              <Td><RagPill status={r.rag} /></Td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader title="Activities pending from TSYS" accent />
          <Table headers={["SN", "Workstream", "Activity", "Leads", "Date Raised"]}>
            {pendingFromTsys.map((r) => (
              <tr key={r.sn} className="border-t border-border/70 hover:bg-muted/40">
                <Td>{r.sn}</Td>
                <Td className="font-medium text-foreground">{r.workstream}</Td>
                <Td className="max-w-[520px] text-foreground/80">{r.activity}</Td>
                <Td>{r.leads}</Td>
                <Td className="tabular-nums">{r.dateRaised}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader title="Risk Log" accent />
          <StatusFilterBar value={riskFilter} onChange={setRiskFilter} />
          <Table
            headers={["SN", "Workstream", "Issue / Risk Detail", "Date Raised", "Status"]}
          >
            {filteredRisks.map((r) => (
              <tr key={r.sn} className="border-t border-border/70 hover:bg-muted/40">
                <Td>{r.sn}</Td>
                <Td className="font-medium text-foreground">{r.workstream}</Td>
                <Td className="max-w-[380px] text-foreground/80">{r.detail}</Td>
                <Td className="tabular-nums whitespace-nowrap">{r.raised}</Td>
                <Td><LogStatusPill status={r.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader title="Decision Log" />
          <StatusFilterBar value={decisionFilter} onChange={setDecisionFilter} />
          <Table
            headers={["SN", "Workstream", "Decision Area", "Decision Details", "Owner", "Status"]}
          >
            {filteredDecisions.map((r) => (
              <tr key={r.sn} className="border-t border-border/70 hover:bg-muted/40">
                <Td>{r.sn}</Td>
                <Td className="font-medium text-foreground">{r.workstream}</Td>
                <Td className="whitespace-nowrap">{r.area}</Td>
                <Td className="max-w-[480px] text-foreground/80">{r.details}</Td>
                <Td className="whitespace-nowrap">{r.owner}</Td>
                <Td><LogStatusPill status={r.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatusFilterBar({
  value,
  onChange,
}: {
  value: LogStatus | "All";
  onChange: (v: LogStatus | "All") => void;
}) {
  const opts: (LogStatus | "All")[] = ["All", "Open", "WIP", "Closed"];
  const colorFor = (o: LogStatus | "All") =>
    o === "Open" ? "#dc2626" : o === "WIP" ? "#d97706" : o === "Closed" ? "#16a34a" : "#475569";
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Filter
      </span>
      {opts.map((o) => {
        const active = value === o;
        const c = colorFor(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition"
            style={{
              background: active ? c : "transparent",
              color: active ? "white" : c,
              borderColor: c,
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: active ? "white" : c }}
            />
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

function Legend() {
  const items: { label: string; status: RagStatus }[] = [
    { label: "Critical", status: "critical" },
    { label: "Possible delay", status: "warning" },
  ];
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-card px-3 py-2 text-xs">
      <span className="font-semibold uppercase tracking-wider text-muted-foreground">Legend</span>
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: ragColor(i.status) }}
          />
          <span className="text-foreground">{i.label}</span>
        </span>
      ))}
    </div>
  );
}

function ragColor(s: RagStatus) {
  return s === "critical"
    ? "var(--rag-critical)"
    : s === "warning"
      ? "var(--rag-warning)"
      : "var(--rag-ontrack)";
}

function RagPill({ status }: { status: RagStatus }) {
  const label = status === "critical" ? "Critical" : status === "warning" ? "Delay" : "On track";
  return (
    <span
      className="inline-flex min-w-[88px] items-center justify-center rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{ background: ragColor(status) }}
    >
      {label}
    </span>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "critical" | "warning" | "ontrack";
}) {
  const bar =
    tone === "info"
      ? "var(--rag-info)"
      : tone === "critical"
        ? "var(--rag-critical)"
        : tone === "warning"
          ? "var(--rag-warning)"
          : "var(--rag-ontrack)";
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: bar }} />
      <div className="pl-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, accent }: { title: string; accent?: boolean }) {
  return (
    <div
      className="px-4 py-2.5 text-sm font-semibold text-white"
      style={{ background: accent ? "var(--fed-navy-deep)" : "var(--fed-navy)" }}
    >
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
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5">
                {h}
              </th>
            ))}
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
