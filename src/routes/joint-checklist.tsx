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

  // KYC & DD
  { sn: 11, workstream: "KYC & DD", task: "Scope finalization for KYC data transfer between banks", finish: "TBD", by: "Bindiya / Varelaxmi & Mathews", owner: "Jointly", status: "NS" },
  { sn: 12, workstream: "KYC & DD", task: "Customer KYC data migration approach finalization", finish: "TBD", by: "Bindiya / Varelaxmi & Mathews", owner: "Jointly", status: "NS" },
  { sn: 13, workstream: "KYC & DD", task: "Fields mapping for KYC details", finish: "TBD", by: "Bindiya / Varelaxmi & Mathews", owner: "Jointly", status: "NS" },
  { sn: 14, workstream: "KYC & DD", task: "SCB to share the List of online and offline documents collected for onboarding and ReKYC", finish: "TBD", by: "Bindiya / Varelaxmi & Mathews", owner: "Jointly", status: "NS" },

  // Operations
  { sn: 15, workstream: "Operations", task: "Process for handover of documents both for physical & digital", finish: "TBD", by: "—", owner: "SCB", status: "IP", comments: "Timelines depend on agreement; digital handover in IT workstream" },
  { sn: 16, workstream: "Operations", task: "Data transfers related to customer's transactional details and financial payments modes (NEFT)", finish: "TBD", by: "—", owner: "SCB", status: "IP", comments: "Part of TSYS workstream" },
  { sn: 17, workstream: "Operations", task: "Confirmation from SCB Head Operations for NIL balance in cheque suspense account", finish: "Fri, 30-Oct-26", by: "Vibhor", owner: "SCB", status: "NS", comments: "Post Cutoff activity" },
  { sn: 18, workstream: "Operations", task: "Handover of other payment suspense balances on the date of migration", finish: "Fri, 30-Oct-26", by: "Vibhor", owner: "Jointly", status: "NS", comments: "Post Cutoff activity" },
  { sn: 19, workstream: "Operations", task: "Dispute Handling post migration (support required for next 90 days for chargeback / backward settlement)", finish: "TBD", by: "—", owner: "Jointly", status: "NS" },
  { sn: 20, workstream: "Operations", task: "Customer holding multiple variant cards — dispute approach", finish: "Fri, 12-Jun-26", by: "—", owner: "Jointly", status: "D", comments: "Discussed in last Chargeback/Disputes call with Federal" },
  { sn: 21, workstream: "Operations", task: "List of pending grievances, litigation, regulatory cases + last 3 months closed complaints and resolution", finish: "Fri, 30-Oct-26", by: "Perveen", owner: "SCB", status: "NS", comments: "Query — share now or post cutoff?" },
  { sn: 22, workstream: "Operations", task: "Payment channel wise data breakup (count & amount, last 3 months)", finish: "TBD", by: "—", owner: "SCB", status: "NS", comments: "Part of TSYS workstream" },
  { sn: 23, workstream: "Operations", task: "Transaction data to be provided since inception of cards", finish: "TBD", by: "—", owner: "SCB", status: "NS", comments: "Part of TSYS workstream" },
  { sn: 24, workstream: "Operations", task: "Count of dispute cases for last 6 months for migrated base (presentment, pre-arb etc.)", finish: "TBD", by: "—", owner: "SCB", status: "NS" },
  { sn: 25, workstream: "Operations", task: "Success % of chargeback to be provided", finish: "TBD", by: "—", owner: "SCB", status: "NS" },
  { sn: 26, workstream: "Operations", task: "Document / SOP for dispute process currently followed at SCB", finish: "TBD", by: "—", owner: "SCB", status: "NS" },
  { sn: 27, workstream: "Operations", task: "In-flight transaction support up to 120 days for filing/closing dispute cases", finish: "TBD", by: "—", owner: "SCB", status: "NS" },
  { sn: 28, workstream: "Operations", task: "POD of card delivered cases for last 3 months", finish: "TBD", by: "—", owner: "SCB", status: "NS" },
  { sn: 29, workstream: "Operations", task: "GL data to be provided on date of cut off", finish: "TBD", by: "—", owner: "SCB", status: "NS", comments: "Part of Finance workstream" },
  { sn: 30, workstream: "Operations", task: "Deaf balance available with SCB (closed accounts not migrated)", finish: "TBD", by: "—", owner: "SCB", status: "NS" },
  { sn: 31, workstream: "Operations", task: "Process for intermediary phase data sharing (chargeback, complaints via IVR / digital channels)", finish: "TBD", by: "—", owner: "SCB", status: "NS" },

  // Product
  { sn: 32, workstream: "Product", task: "EMT introductory meeting with FB team", finish: "NA", by: "Rahoul / Jaydithya", owner: "SCB", status: "D" },
  { sn: 33, workstream: "Product", task: "DigiSmart Card alliance", finish: "Tue, 30-Jun-26", by: "Libu", owner: "Jointly", status: "IP", comments: "Discussion initiated with SCB; Libu to set up engagement call with partner" },
  { sn: 34, workstream: "Product", task: "Present and share services currently provided at SCB", finish: "TBD", by: "Rahoul / Jaydithya", owner: "SCB", status: "IP" },
  { sn: 35, workstream: "Product", task: "Agree on current services to migrate / continue / seize post cutover", finish: "Wed, 17-Jun-26", by: "Libu", owner: "FB", status: "IP", comments: "Flexi-loan & EMI Card continuation to be decided" },
  { sn: 36, workstream: "Product", task: "Testing of services offered at Destination Product suite", finish: "TBD", by: "Libu", owner: "FB", status: "NS", comments: "Post production setup" },
  { sn: 37, workstream: "Product", task: "Coordinate with SCB to provide 360 rewards features", finish: "TBD", by: "Rahoul / Jaydithya", owner: "SCB", status: "D", comments: "R360 portal — 75% vouchers / 25% products" },
  { sn: 38, workstream: "Product", task: "Finalise Product mapping exercise", finish: "NA", by: "Libu", owner: "FB", status: "D" },
  { sn: 39, workstream: "Product", task: "EMI / Loan rates configuration", finish: "Tue, 30-Jun-26", by: "Rahoul / Jaydithya", owner: "SCB", status: "IP" },
  { sn: 40, workstream: "Product", task: "Card name decision making", finish: "Tue, 30-Jun-26", by: "Leadership", owner: "Jointly", status: "IP" },
  { sn: 41, workstream: "Product", task: "Flexi-loan current outstanding list of customers / vol. / remaining tenure", finish: "Tue, 30-Jun-26", by: "Rahoul / Jaydithya", owner: "SCB", status: "IP", comments: "43 active flexi loans, balance 22,68,082. SCB to obtain consent and convert to DAL" },
  { sn: 42, workstream: "Product", task: "Understand list of services / campaigns from TSYS and discuss jointly (SCB, TSYS, FB)", finish: "Tue, 30-Jun-26", by: "Libu", owner: "FB", status: "NS" },
  { sn: 43, workstream: "Product", task: "Customer type — scope finalisation", finish: "Tue, 30-Jun-26", by: "—", owner: "Jointly", status: "NS" },
  { sn: 44, workstream: "Product", task: "Approach for transfer of data (structured/unstructured/transactional); decision on digital copies transfer", finish: "Tue, 30-Jun-26", by: "—", owner: "Jointly", status: "NS", comments: "List of digital copies shared with SCB" },
  { sn: 45, workstream: "Product", task: "Alignment on statement, billing, collections during cutover", finish: "Tue, 30-Jun-26", by: "—", owner: "Jointly", status: "NS" },

  // IT
  { sn: 46, workstream: "IT", task: "Agreement on mechanism for transferring unstructured data", finish: "Tue, 30-Jun-26", by: "Reema, Dinu", owner: "Jointly", status: "D", comments: "Data via SFTP; MOM shared 23 Jun" },
  { sn: 47, workstream: "IT", task: "Testing of files placed through SFTP (file and size)", finish: "Fri, 03-Jul-26", by: "Dinu", owner: "Jointly", status: "NS" },
  { sn: 48, workstream: "IT", task: "Document from SCB describing unique identifier and data folder organisation mechanism", finish: "Fri, 03-Jul-26", by: "Sandhya", owner: "Jointly", status: "IP", comments: "By 26 Jun per Sandhya" },
  { sn: 49, workstream: "IT", task: "Feasibility check on the scope of unstructured data", finish: "Fri, 31-Jul-26", by: "—", owner: "Jointly", status: "NS" },
  { sn: 50, workstream: "IT", task: "FB to share CIF creation template with SCB for review", finish: "Wed, 03-Jun-26", by: "Dinu", owner: "FB", status: "D", comments: "Details shared for SCB review" },
  { sn: 51, workstream: "IT", task: "Alignment on CIF creation template and CKYC details", finish: "Thu, 18-Jun-26", by: "Sandhya, Utkarsh", owner: "SCB", status: "D" },
  { sn: 52, workstream: "IT", task: "Sample data to be received by SCB", finish: "Mon, 29-Jun-26", by: "Utkarsh", owner: "SCB", status: "IP", comments: "Data received 25 Jun; Dinu requested mapping" },
  { sn: 53, workstream: "IT", task: "Transformation and loading scripts for FB", finish: "Wed, 15-Jul-26", by: "Dinu", owner: "FB", status: "NS" },
  { sn: 54, workstream: "IT", task: "Testing of sample data", finish: "Thu, 30-Jul-26", by: "Dinu", owner: "Jointly", status: "NS" },
  { sn: 55, workstream: "IT", task: "SCB to share the production customer data for CIF creation", finish: "Sat, 01-Aug-26", by: "Reema", owner: "SCB", status: "NS" },
  { sn: 56, workstream: "IT", task: "FB to create the customer profiles", finish: "Fri, 31-Jul-26", by: "Dinu", owner: "FB", status: "NS" },
  { sn: 57, workstream: "IT", task: "Migration dry runbook (cutover time, freeze period, downtime/uptime)", finish: "TBD", by: "Reema, Dinu", owner: "Jointly", status: "NS" },
];

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
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.sn} className="border-t hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2 max-w-md">{r.task}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">{r.finish || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">{r.by}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ownerMeta[r.owner]}`}>
                          {r.owner}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta[r.status].cls}`}
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