import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../components/DashboardShell";

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

const seed: ChecklistItem[] = [
  { sn: 1, workstream: "Customer Service", task: "Walk through Handling of clients Complaints/issues", duration: "Mon, 22-Jun-26", start: "Mon, 22-Jun-26", finish: "Wed, 24-Jun-26", by: "Nisha", owner: "SCB", status: "D" },
  { sn: 2, workstream: "Customer Service", task: "Dashboard for customer service for last 3 months", finish: "Wed, 24-Jun-26", by: "Nisha", owner: "Jointly", status: "D" },
  { sn: 3, workstream: "Customer Service", task: "Existing data quality and gaps highlighted by SCB audits", finish: "TBD", by: "Nisha/Bhagyashree", owner: "Jointly", status: "NS" },
  { sn: 4, workstream: "Customer Service", task: "SOP for open customer services", finish: "TBD", by: "Nisha/Bhagyashree", owner: "Jointly", status: "NS" },
  { sn: 5, workstream: "Customer Service", task: "L1, L2 support process followed at SCB end", finish: "TBD", by: "Nisha", owner: "SCB", status: "NS" },
  { sn: 6, workstream: "Customer Service", task: "Align with Product / Business teams on activities and support required prior to Card distribution Exercise", finish: "TBD", by: "Nisha/Bhagyashree", owner: "SCB", status: "NS" },
  { sn: 7, workstream: "Customer Service", task: "Approach of handling of Clients Queries - Card Distribution Process", finish: "TBD", by: "Nisha/Bhagyashree", owner: "Jointly", status: "NS" },
  { sn: 8, workstream: "Customer Service", task: "Based on Credit cards Queries received by CE through various channels, work with Comms Workstream to produce FAQs to support transition", finish: "TBD", by: "Bhagyashree", owner: "SCB", status: "NS" },
  { sn: 9, workstream: "Customer Service", task: "Agree the list of Pre Migration CE activities, including approach to re-route queries pertaining to Scoped clients to FB", finish: "TBD", by: "Nisha/Bhagyashree", owner: "Jointly", status: "NS" },
  { sn: 10, workstream: "Customer Service", task: "Agree the list of Post Migration CE activities, including assigning the owner of the activities", finish: "TBD", by: "Nisha/Bhagyashree", owner: "SCB", status: "NS" },
];

const STORAGE_KEY = "joint-checklist-v1";

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
                <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 w-10">#</th>
                    <th className="px-3 py-2">Task</th>
                    <th className="px-3 py-2">Finish</th>
                    <th className="px-3 py-2">By Who</th>
                    <th className="px-3 py-2">Owner</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.sn} className="border-t hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground">{r.sn}</td>
                      <td className="px-3 py-2 max-w-md">{r.task}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">{r.finish || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">{r.by}</td>
                      <td className="px-3 py-2">
                        <select
                          value={r.owner}
                          onChange={(e) => update(r.sn, { owner: e.target.value as Owner })}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${ownerMeta[r.owner]}`}
                        >
                          <option value="SCB">SCB</option>
                          <option value="FB">FB</option>
                          <option value="Jointly">Jointly</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={r.status}
                          onChange={(e) => update(r.sn, { status: e.target.value as Status })}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta[r.status].cls}`}
                        >
                          <option value="NS">Not Started</option>
                          <option value="IP">In Progress</option>
                          <option value="D">Done</option>
                          <option value="B">Blocked</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={r.comments || ""}
                          onChange={(e) => update(r.sn, { comments: e.target.value })}
                          placeholder="Add note…"
                          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs hover:border-border focus:border-border focus:outline-none"
                        />
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