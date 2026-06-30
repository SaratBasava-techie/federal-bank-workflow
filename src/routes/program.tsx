import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  programKpis,
} from "@/lib/dashboard-data";
import activitiesData from "@/lib/workflow-activities.json";

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
        <ActivityList />
      </div>
    </DashboardShell>
  );
}

interface RawActivity {
  sr: number;
  workstream: string;
  phase: string;
  ledBy: string;
  activity: string;
  owner: string;
  status: string;
  endDate: string;
  month: string;
}

const ALL_ACTIVITIES = (activitiesData as RawActivity[]).map((a) => ({
  ...a,
  status: normalizeStatus(a.status),
}));

function normalizeStatus(s: string): "Completed" | "WIP" | "In Progress" | "Not Started" {
  const v = (s || "").trim().toLowerCase();
  if (v === "completed" || v === "complete") return "Completed";
  if (v === "wip") return "WIP";
  if (v === "in progress" || v === "inprogress") return "In Progress";
  return "Not Started";
}

const STATUS_META: Record<string, { color: string; label: string }> = {
  Completed: { color: "#16a34a", label: "Completed" },
  WIP: { color: "#f59e0b", label: "WIP" },
  "In Progress": { color: "#0ea5e9", label: "In Progress" },
  "Not Started": { color: "#94a3b8", label: "Not Started" },
};

const WORKSTREAM_ORDER = Array.from(
  new Set((activitiesData as RawActivity[]).map((a) => a.workstream)),
);

function ActivityList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Completed" | "WIP" | "In Progress" | "Not Started">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "overdue" | "soon" | "later">("all");
  const [openStreams, setOpenStreams] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    WORKSTREAM_ORDER.forEach((w) => (init[w] = true));
    return init;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, RawActivity[]>();
    ALL_ACTIVITIES.forEach((a) => {
      const list = map.get(a.workstream) || [];
      list.push(a);
      map.set(a.workstream, list);
    });
    WORKSTREAM_ORDER.forEach((w) => {
      if (!map.has(w)) map.set(w, []);
    });
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, []);

  const toggle = (w: string) => setOpenStreams((s) => ({ ...s, [w]: !s[w] }));

  const filtered = grouped.map(([ws, list]) => {
    const q = search.toLowerCase();
    const filteredList = list.filter(
      (a) => {
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        if (urgencyFilter !== "all" && urgencyOf(a.endDate) !== urgencyFilter) return false;
        if (!q) return true;
        return (
          a.activity.toLowerCase().includes(q) ||
          (a.owner || "").toLowerCase().includes(q) ||
          a.phase.toLowerCase().includes(q) ||
          a.endDate.toLowerCase().includes(q)
        );
      },
    );
    return [ws, filteredList] as const;
  });

  const totalShown = filtered.reduce((sum, [, list]) => sum + list.length, 0);
  const totalAll = ALL_ACTIVITIES.length;

  return (
    <div className="mt-6">
      <Panel title={`Activities by Workstream — ${totalShown} of ${totalAll}`}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity, lead, phase or deadline…"
            className="min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition focus:border-[var(--fed-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--fed-gold)]/30"
          />
          <FilterChips
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as typeof statusFilter)}
            options={[
              { v: "all", label: "All" },
              { v: "Completed", label: "Completed", swatch: STATUS_META.Completed.color },
              { v: "WIP", label: "WIP", swatch: STATUS_META.WIP.color },
              { v: "In Progress", label: "In Progress", swatch: STATUS_META["In Progress"].color },
              { v: "Not Started", label: "Not Started", swatch: STATUS_META["Not Started"].color },
            ]}
          />
          <FilterChips
            label="Deadline"
            value={urgencyFilter}
            onChange={(v) => setUrgencyFilter(v as typeof urgencyFilter)}
            options={[
              { v: "all", label: "All" },
              { v: "overdue", label: "Overdue", swatch: "#dc2626" },
              { v: "soon", label: "Due soon", swatch: "#2563eb" },
              { v: "later", label: "On track", swatch: "#16a34a" },
            ]}
          />
          <button
            onClick={() =>
              setOpenStreams((s) => {
                const allOpen = WORKSTREAM_ORDER.every((w) => s[w] !== false);
                const next: Record<string, boolean> = {};
                WORKSTREAM_ORDER.forEach((w) => (next[w] = !allOpen));
                return next;
              })
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium transition hover:bg-muted hover:shadow-sm"
          >
            Expand / Collapse All
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map(([ws, list]) => {
            const isOpen = openStreams[ws] !== false;
            const overdue = list.filter((a) => urgencyOf(a.endDate) === "overdue").length;
            const soon = list.filter((a) => urgencyOf(a.endDate) === "soon").length;
            return (
              <div
                key={ws}
                className="overflow-hidden rounded-lg border border-border bg-card transition hover:border-[var(--fed-gold)]/60 hover:shadow-md"
              >
                <button
                  onClick={() => toggle(ws)}
                  className="group flex w-full items-center justify-between gap-3 bg-gradient-to-r from-muted/60 to-muted/20 px-4 py-3 text-sm font-semibold text-foreground transition hover:from-muted/80 hover:to-muted/40"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: streamColor(ws) }}
                    />
                    <span>{ws}</span>
                    <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                      {list.length}
                    </span>
                    {overdue > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                        style={{ background: "var(--rag-critical)" }}
                      >
                        {overdue} overdue
                      </span>
                    )}
                    {soon > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                        style={{ background: "var(--rag-watch, #d97706)" }}
                      >
                        {soon} due soon
                      </span>
                    )}
                  </span>
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div className="animate-fade-in overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Activity</th>
                          <th className="px-3 py-2">Phase</th>
                          <th className="px-3 py-2">Owner</th>
                          <th className="px-3 py-2">Deadline</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((a) => (
                          <tr
                            key={a.sr}
                            className="border-t border-border transition-colors hover:bg-muted/40"
                          >
                            <td className="px-3 py-2 text-xs text-muted-foreground">
                              {a.sr}
                            </td>
                            <td className="px-3 py-2 text-foreground/90">{a.activity}</td>
                            <td className="px-3 py-2 text-xs">{a.phase || "—"}</td>
                            <td className="px-3 py-2 text-xs">
                              <OwnerBadge owner={a.owner} />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              <DeadlinePill date={a.endDate} />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              <StatusPill status={a.status} />
                            </td>
                          </tr>
                        ))}
                        {list.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-3 py-6 text-center text-sm text-muted-foreground"
                            >
                              No activities match your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function FilterChips({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string; swatch?: string }[];
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm">
      <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {options.map((o) => {
        const active = o.v === value;
        const toneColor = o.swatch || "var(--fed-navy, #0b2545)";
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition"
            style={{
              background: active ? toneColor : "transparent",
              color: active ? "white" : "var(--color-muted-foreground)",
            }}
          >
            {o.swatch && (
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: active ? "white" : o.swatch }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function OwnerBadge({ owner }: { owner: string }) {
  if (!owner) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        background: "color-mix(in oklab, var(--fed-gold, #f59e0b) 22%, transparent)",
        color: "var(--fed-navy, #0b2545)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--fed-gold, #f59e0b)" }}
      />
      {owner}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META["Not Started"];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold"
      style={{
        background: `color-mix(in oklab, ${meta.color} 18%, transparent)`,
        color: meta.color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

function urgencyOf(date: string): "overdue" | "soon" | "later" | "unknown" {
  // Source format e.g. "30-Jun" or "5-Oct" — assume programme year 2026.
  let t = Date.parse(date);
  if (Number.isNaN(t)) {
    const m = /^(\d{1,2})-([A-Za-z]{3})$/.exec(date.trim());
    if (m) t = Date.parse(`${m[1]} ${m[2]} 2026`);
  }
  if (Number.isNaN(t)) return "unknown";
  const now = Date.now();
  const days = (t - now) / 86400000;
  if (days < 0) return "overdue";
  if (days <= 30) return "soon";
  return "later";
}

function DeadlinePill({ date }: { date: string }) {
  const u = urgencyOf(date);
  const color =
    u === "overdue"
      ? "#dc2626"
      : u === "soon"
        ? "#2563eb"
        : u === "later"
          ? "#16a34a"
          : "var(--color-muted-foreground)";
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full ring-2"
        style={{ background: color, boxShadow: `0 0 0 2px color-mix(in oklab, ${color} 25%, transparent)` }}
        title={u}
      />
      <span className="tabular-nums">{date || "—"}</span>
    </span>
  );
}

const STREAM_COLORS: Record<string, string> = {
  "Approach & Key Decisions": "#6366f1",
  "Platform/Infrastructure": "#0ea5e9",
  "Application Build & Support": "#14b8a6",
  "Data Migration": "#f59e0b",
  "Scheme & Compliance": "#ef4444",
  "Channel Connectivity": "#8b5cf6",
  Business: "#22c55e",
  Contracting: "#ec4899",
};
function streamColor(ws: string) {
  return STREAM_COLORS[ws] || "#94a3b8";
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