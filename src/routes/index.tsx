import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/DashboardShell";
import {
  ragSummary,
  pendingFromTsys,
  decisionRiskLogs,
  type DecisionRiskStatus,
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

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Open items" value={ragSummary.length} tone="info" />
        <StatTile label="Critical" value={counts.critical ?? 0} tone="critical" />
        <StatTile label="Possible delay" value={counts.warning ?? 0} tone="warning" />
        <StatTile label="On track" value={counts.ontrack ?? 0} tone="ontrack" />
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
          <CardHeader title="Decision and Risk Logs" />
          <Table
            headers={["SN", "Type", "Workstream", "Description", "Owner", "Raised", "Target", "Impact", "Status"]}
          >
            {decisionRiskLogs.map((r) => (
              <tr key={r.sn} className="border-t border-border/70 hover:bg-muted/40">
                <Td>{r.sn}</Td>
                <Td><TypePill type={r.type} /></Td>
                <Td className="font-medium text-foreground">{r.workstream}</Td>
                <Td className="max-w-[480px] text-foreground/80">{r.description}</Td>
                <Td>{r.owner}</Td>
                <Td className="tabular-nums">{r.raised}</Td>
                <Td className="tabular-nums">{r.target}</Td>
                <Td><ImpactPill impact={r.impact} /></Td>
                <Td><DRStatusPill status={r.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </DashboardShell>
  );
}

function TypePill({ type }: { type: "Decision" | "Risk" }) {
  const isRisk = type === "Risk";
  const color = isRisk ? "var(--rag-critical)" : "var(--fed-navy, #0b2545)";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {type}
    </span>
  );
}

function ImpactPill({ impact }: { impact: "High" | "Medium" | "Low" }) {
  const color = impact === "High" ? "#dc2626" : impact === "Medium" ? "#d97706" : "#16a34a";
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
    >
      {impact}
    </span>
  );
}

function DRStatusPill({ status }: { status: DecisionRiskStatus }) {
  const color =
    status === "Open" ? "#dc2626" : status === "In Review" ? "#d97706" : "#16a34a";
  return (
    <span
      className="inline-flex min-w-[80px] items-center justify-center rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
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
    { label: "On track", status: "ontrack" },
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
