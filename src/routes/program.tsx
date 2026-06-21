import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell } from "@/components/DashboardShell";
import {
  activitiesPerWeek,
  completionByPhase,
  completionStatus,
  immediateAttention,
  programKpis,
} from "@/lib/dashboard-data";

export const Route = createFileRoute("/program")({
  head: () => ({
    meta: [
      { title: "Program Overview · Federal Bank Programme" },
      {
        name: "description",
        content:
          "Executive program overview for the Standard Chartered to Federal Bank credit card migration: KPIs, phase completion and weekly activity flow.",
      },
      { property: "og:title", content: "Program Overview · Federal Bank Programme" },
      {
        property: "og:description",
        content:
          "Executive program overview for the Standard Chartered to Federal Bank credit card migration.",
      },
    ],
  }),
  component: ProgramPage,
});

function ProgramPage() {
  const k = programKpis;
  return (
    <DashboardShell>
      <section className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Programme Overview — June&nbsp;2026
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Snapshot of activity throughput, phase progress and weekly demand.
        </p>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-border md:grid-cols-6">
        <Kpi label="Total Activities" value={k.total} sub="Project activities" tone="navy" />
        <Kpi label="Completed" value={k.completed} sub={`${pct(k.completed, k.total)}% of total`} tone="ontrack" />
        <Kpi label="In Progress" value={k.inProgress} sub="Activities active" tone="info" />
        <Kpi label="Not Started" value={k.notStarted} sub="Pending start" tone="muted" />
        <Kpi label="Overdue / At Risk" value={k.atRisk} sub="Requires immediate action" tone="critical" />
        <Kpi label="Overall Progress" value={`${k.overall}%`} sub="Completion rate" tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Activity Completion Status">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={completionStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="var(--color-card)"
                >
                  {completionStatus.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="% Completion by Phase">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart
                data={completionByPhase}
                layout="vertical"
                margin={{ left: 10, right: 24, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="phase"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  width={78}
                />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Complete"]}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="pct" fill="oklch(0.6 0.13 195)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Activities Due per Week">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={activitiesPerWeek} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="due"
                  name="Due (pending)"
                  stroke="var(--rag-critical)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="var(--rag-ontrack)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Activities that require immediate attention">
          <ol className="space-y-2">
            {immediateAttention.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-md border border-border bg-background px-3 py-2.5 text-sm"
              >
                <span
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                  style={{ background: "var(--rag-critical)" }}
                >
                  {i + 1}
                </span>
                <span className="text-foreground/85">{item}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </DashboardShell>
  );
}

function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  tone: "navy" | "ontrack" | "info" | "muted" | "critical" | "accent";
}) {
  const bg =
    tone === "navy"
      ? "var(--fed-navy-deep)"
      : tone === "ontrack"
        ? "oklch(0.32 0.1 155)"
        : tone === "info"
          ? "oklch(0.28 0.08 220)"
          : tone === "muted"
            ? "oklch(0.28 0.04 255)"
            : tone === "critical"
              ? "oklch(0.35 0.16 25)"
              : "oklch(0.22 0.07 230)";
  const accentText =
    tone === "accent" ? "oklch(0.78 0.13 195)" : tone === "ontrack" ? "oklch(0.85 0.18 150)" : "white";
  return (
    <div className="border-r border-white/10 px-4 py-3 text-white last:border-r-0" style={{ background: bg }}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
        {label}
      </div>
      <div
        className="mt-1 text-3xl font-semibold tabular-nums"
        style={{ color: accentText }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-white/60">{sub}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="border-b border-border px-4 py-2.5 text-sm font-semibold text-foreground">
        {title}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}