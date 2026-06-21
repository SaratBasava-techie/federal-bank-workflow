import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import activitiesData from "@/lib/workflow-activities.json";

export const Route = createFileRoute("/tracker")({
  component: TrackerPage,
});

type Activity = {
  sr: number;
  workstream: string;
  phase: string;
  ledBy: string;
  activity: string;
  endDate: string;
  month: string;
};

type Status = "Not Started" | "In Progress" | "Completed" | "Blocked";

type Assignment = { owner: string; status: Status; notes?: string };

const ACTIVITIES = activitiesData as Activity[];
const STORAGE_KEY = "fb-work-tracker-v1";
const EMPLOYEES_KEY = "fb-work-tracker-employees-v1";

const DEFAULT_EMPLOYEES = [
  "Aarav Menon",
  "Priya Nair",
  "Rahul Iyer",
  "Sneha Pillai",
  "Vikram Kurian",
  "Anjali Thomas",
];

const STATUSES: Status[] = ["Not Started", "In Progress", "Completed", "Blocked"];

function loadAssignments(): Record<number, Assignment> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function loadEmployees(): string[] {
  if (typeof window === "undefined") return DEFAULT_EMPLOYEES;
  try {
    const v = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "null");
    return Array.isArray(v) && v.length ? v : DEFAULT_EMPLOYEES;
  } catch {
    return DEFAULT_EMPLOYEES;
  }
}

function statusColor(s: Status) {
  switch (s) {
    case "Completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "In Progress":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Blocked":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function TrackerPage() {
  const [assignments, setAssignments] = useState<Record<number, Assignment>>({});
  const [employees, setEmployees] = useState<string[]>(DEFAULT_EMPLOYEES);
  const [newEmp, setNewEmp] = useState("");
  const [filters, setFilters] = useState({
    employee: "",
    month: "",
    workstream: "",
    status: "",
    q: "",
  });

  useEffect(() => {
    setAssignments(loadAssignments());
    setEmployees(loadEmployees());
  }, []);

  const save = (next: Record<number, Assignment>) => {
    setAssignments(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveEmps = (next: string[]) => {
    setEmployees(next);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(next));
  };

  const setField = (sr: number, patch: Partial<Assignment>) => {
    const cur = assignments[sr] || { owner: "", status: "Not Started" as Status };
    save({ ...assignments, [sr]: { ...cur, ...patch } });
  };

  const months = useMemo(
    () => Array.from(new Set(ACTIVITIES.map((a) => a.month).filter(Boolean))),
    [],
  );
  const workstreams = useMemo(
    () => Array.from(new Set(ACTIVITIES.map((a) => a.workstream).filter(Boolean))),
    [],
  );

  const filtered = ACTIVITIES.filter((a) => {
    const as = assignments[a.sr];
    if (filters.employee && (as?.owner || "") !== filters.employee) return false;
    if (filters.month && a.month !== filters.month) return false;
    if (filters.workstream && a.workstream !== filters.workstream) return false;
    if (filters.status && (as?.status || "Not Started") !== filters.status) return false;
    if (filters.q && !a.activity.toLowerCase().includes(filters.q.toLowerCase()))
      return false;
    return true;
  });

  // KPIs
  const total = ACTIVITIES.length;
  const counts = ACTIVITIES.reduce(
    (acc, a) => {
      const s = assignments[a.sr]?.status || "Not Started";
      acc[s] = (acc[s] || 0) + 1;
      if (assignments[a.sr]?.owner) acc.assigned += 1;
      return acc;
    },
    { assigned: 0 } as Record<string, number>,
  );
  const completed = counts["Completed"] || 0;
  const inProgress = counts["In Progress"] || 0;
  const blocked = counts["Blocked"] || 0;
  const unassigned = total - counts.assigned;
  const pct = Math.round((completed / total) * 100);

  // Per-employee summary
  const perEmp = employees.map((e) => {
    const items = ACTIVITIES.filter((a) => assignments[a.sr]?.owner === e);
    const done = items.filter((a) => assignments[a.sr]?.status === "Completed").length;
    const wip = items.filter((a) => assignments[a.sr]?.status === "In Progress").length;
    const blk = items.filter((a) => assignments[a.sr]?.status === "Blocked").length;
    return { name: e, total: items.length, done, wip, blk };
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Employee Work Tracker
          </h2>
          <p className="text-sm text-muted-foreground">
            Assign each migration activity to an employee and track progress through to
            completion. Updates are saved locally on this device.
          </p>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi label="Total Activities" value={total} />
          <Kpi label="Assigned" value={counts.assigned} sub={`${unassigned} unassigned`} />
          <Kpi label="In Progress" value={inProgress} accent="amber" />
          <Kpi label="Completed" value={completed} accent="emerald" sub={`${pct}%`} />
          <Kpi label="Blocked" value={blocked} accent="rose" />
        </section>

        {/* Progress bar */}
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Overall completion</span>
            <span className="text-muted-foreground">
              {completed} / {total} ({pct}%)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </section>

        {/* Employee summary */}
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Employee workload</h3>
            <div className="flex items-center gap-2">
              <input
                value={newEmp}
                onChange={(e) => setNewEmp(e.target.value)}
                placeholder="Add employee name"
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              />
              <button
                onClick={() => {
                  const n = newEmp.trim();
                  if (n && !employees.includes(n)) {
                    saveEmps([...employees, n]);
                    setNewEmp("");
                  }
                }}
                className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Add
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Assigned</th>
                  <th className="py-2 pr-3">In Progress</th>
                  <th className="py-2 pr-3">Completed</th>
                  <th className="py-2 pr-3">Blocked</th>
                  <th className="py-2 pr-3">Progress</th>
                </tr>
              </thead>
              <tbody>
                {perEmp.map((e) => {
                  const p = e.total ? Math.round((e.done / e.total) * 100) : 0;
                  return (
                    <tr key={e.name} className="border-t border-border">
                      <td className="py-2 pr-3 font-medium">{e.name}</td>
                      <td className="py-2 pr-3">{e.total}</td>
                      <td className="py-2 pr-3">{e.wip}</td>
                      <td className="py-2 pr-3">{e.done}</td>
                      <td className="py-2 pr-3">{e.blk}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${p}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{p}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <input
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Search activity…"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Select
              value={filters.employee}
              onChange={(v) => setFilters({ ...filters, employee: v })}
              options={["", ...employees]}
              placeholder="All employees"
            />
            <Select
              value={filters.month}
              onChange={(v) => setFilters({ ...filters, month: v })}
              options={["", ...months]}
              placeholder="All months"
            />
            <Select
              value={filters.workstream}
              onChange={(v) => setFilters({ ...filters, workstream: v })}
              options={["", ...workstreams]}
              placeholder="All workstreams"
            />
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
              options={["", ...STATUSES]}
              placeholder="All statuses"
            />
          </div>
        </section>

        {/* Activities table */}
        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-3 text-sm font-semibold">
            Activities ({filtered.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2">Workstream</th>
                  <th className="px-3 py-2">Phase</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Assign to</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const as = assignments[a.sr] || { owner: "", status: "Not Started" as Status };
                  const done = as.status === "Completed";
                  return (
                    <tr
                      key={a.sr}
                      className={`border-t border-border ${done ? "bg-emerald-50/40" : ""}`}
                    >
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.sr}</td>
                      <td className={`px-3 py-2 ${done ? "line-through text-muted-foreground" : ""}`}>
                        {a.activity}
                      </td>
                      <td className="px-3 py-2 text-xs">{a.workstream}</td>
                      <td className="px-3 py-2 text-xs">{a.phase}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        {a.endDate}
                      </td>
                      <td className="px-3 py-2">
                        <Select
                          value={as.owner}
                          onChange={(v) => setField(a.sr, { owner: v })}
                          options={["", ...employees]}
                          placeholder="—"
                          small
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={as.status}
                          onChange={(e) =>
                            setField(a.sr, { status: e.target.value as Status })
                          }
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusColor(
                            as.status,
                          )}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-sm text-muted-foreground"
                    >
                      No activities match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "emerald" | "amber" | "rose";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-700"
      : accent === "amber"
        ? "text-amber-700"
        : accent === "rose"
          ? "text-rose-700"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  small,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  small?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border border-input bg-background ${
        small ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
      }`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "" ? placeholder || "All" : o}
        </option>
      ))}
    </select>
  );
}