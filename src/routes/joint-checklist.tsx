import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../components/DashboardShell";
import { useDashboardData } from "../hooks/useDashboardData";

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "—";
  const months: Record<string, string> = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
  const m = dateStr.match(/(\d{1,2})[- ]([A-Za-z]{3})[- ]?(\d{2,4})?/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = months[m[2].toLowerCase()] || "01";
    let y = m[3] || "2026";
    if (y.length === 2) y = "20" + y;
    return `${d}/${mo}/${y}`;
  }
  return dateStr;
}

export const Route = createFileRoute("/joint-checklist")({
  component: JointChecklistPage,
});

type Status = "NS" | "IP" | "D" | "B";
type Owner = "SCB" | "FB" | "Jointly";

interface ChecklistItem {
  sn: number;
  workstream: string;
  task: string;
  duration?: string;
  start?: string;
  finish?: string;
  by: string;
  owner: Owner;
  status: Status;
  comments?: string;
}

import seedData from "../lib/checklist-data.json";

const seed: ChecklistItem[] = seedData as ChecklistItem[];

const STORAGE_KEY = "joint-checklist-v2";

const statusMeta: Record<Status, { label: string; cls: string }> = {
  NS: { label: "Not Started", cls: "bg-slate-200 text-slate-700" },
  IP: { label: "In Progress", cls: "bg-amber-100 text-amber-800" },
  D: { label: "Done", cls: "bg-emerald-100 text-emerald-800" },
  B: { label: "Blocked", cls: "bg-rose-100 text-rose-800" },
};

const ownerMeta: Record<Owner, string> = {
  SCB: "bg-blue-100 text-blue-800",
  FB: "bg-yellow-100 text-yellow-900",
  Jointly: "bg-purple-100 text-purple-800",
};

function JointChecklistPage() {
  const { data: response } = useDashboardData();
  const liveChecklist = response?.data?.checklist ?? [];
  const [items, setItems] = useState<ChecklistItem[]>(seed);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (liveChecklist && liveChecklist.length > 0) {
      setItems(liveChecklist);
    }
  }, [liveChecklist]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const update = (sn: number, patch: Partial<ChecklistItem>) =>
    setItems((prev) => prev.map((i) => (i.sn === sn ? { ...i, ...patch } : i)));

  const counts = useMemo(() => {
    const c = { NS: 0, IP: 0, D: 0, B: 0 } as Record<Status, number>;
    items.forEach((i) => c[i.status]++);
    return c;
  }, [items]);

  const pct = items.length ? Math.round((counts.D / items.length) * 100) : 0;

  const visible = items.filter((i) => {
    if (filter !== "all" && i.status !== filter) return false;
    if (query && !i.task.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const grouped = visible.reduce<Record<string, ChecklistItem[]>>((acc, i) => {
    (acc[i.workstream] ||= []).push(i);
    return acc;
  }, {});

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Joint Workstream Checklist</h2>
          <p className="text-sm text-muted-foreground">Track SCB / FB / Jointly-owned activities and update status as work progresses.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi label="Total" value={items.length} />
          <Kpi label="Done" value={counts.D} tone="emerald" />
          <Kpi label="In Progress" value={counts.IP} tone="amber" />
          <Kpi label="Not Started" value={counts.NS} tone="slate" />
          <Kpi label="Blocked" value={counts.B} tone="rose" />
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall completion</span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "NS", "IP", "D", "B"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-muted"
              }`}
            >
              {f === "all" ? "All" : statusMeta[f].label}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="ml-auto w-64 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>

        {Object.entries(grouped).map(([ws, rows]) => (
          <div key={ws} className="overflow-hidden rounded-lg border bg-card">
            <div className="border-b bg-muted/50 px-4 py-2 text-sm font-semibold">{ws}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left w-12">#</th>
                    <th className="px-3 py-2.5 text-left">Task</th>
                    <th className="px-3 py-2.5 text-left w-32">Finish</th>
                    <th className="px-3 py-2.5 text-left w-44">By Who</th>
                    <th className="px-3 py-2.5 text-left w-24">Owner</th>
                    <th className="px-3 py-2.5 text-left w-28">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.sn} className="border-t hover:bg-muted/20 align-top">
                      <td className="px-3 py-3 text-muted-foreground tabular-nums text-left">{idx + 1}</td>
                      <td className="px-3 py-3 text-foreground break-words whitespace-normal text-left">{r.task}</td>
                      <td className="px-3 py-3 text-xs break-words whitespace-normal text-left tabular-nums">{formatDate(r.finish)}</td>
                      <td className="px-3 py-3 text-xs break-words whitespace-normal text-left">{r.by}</td>
                      <td className="px-3 py-3 text-left">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${ownerMeta[r.owner]}`}>
                          {r.owner}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-left">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusMeta[r.status].cls}`}
                        >
                          {statusMeta[r.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function Kpi({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "emerald" | "amber" | "rose" }) {
  const tones: Record<string, string> = {
    slate: "text-slate-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
  };
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</div>
    </div>
  );
}