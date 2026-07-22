import * as XLSX from "xlsx";
import type {
  DashboardData,
  RagItem,
  PendingItem,
  ActivityItem,
  RiskLogItem,
  DecisionLogItem,
  ChecklistItem,
} from "./onedrive-excel";

// ─────────────────────────────────────────────────────────────────────
// Multi-file dashboard workbook parser.
//
// Each uploaded file is a SEPARATE workbook that maps to one dashboard
// module (RAG, Program Overview, Joint Workstream Checklist, Risk Log,
// Decision Log). The real KPMG workbooks have title/legend banner rows
// ABOVE the actual column headers, so we detect the header row instead of
// blindly trusting row 1 — that is what previously caused the
// "No dashboard data was found" error.
// ─────────────────────────────────────────────────────────────────────

export type ModuleType = "rag" | "program" | "checklist" | "risk" | "decision" | "unknown";

const MODULE_LABEL: Record<ModuleType, string> = {
  rag: "RAG Summary",
  program: "Program Overview",
  checklist: "Joint Workstream Checklist",
  risk: "Risk Log",
  decision: "Decision Log",
  unknown: "Unrecognized",
};

export interface FileSummary {
  fileName: string;
  type: ModuleType;
  label: string;
  rows: number;
  /** DashboardData keys this file populated */
  modules: (keyof DashboardData)[];
}

export interface ParsedUpload {
  /** Only the modules that parsed successfully (rows > 0) are present. */
  data: Partial<DashboardData>;
  summary: FileSummary[];
  totalRows: number;
}

// ─── Value helpers ───────────────────────────────────────────────────
function str(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function normalizeRag(v: unknown): "critical" | "warning" | "ontrack" {
  const s = str(v).toLowerCase();
  if (["red", "critical", "high", "r", "h"].includes(s)) return "critical";
  if (["amber", "warning", "yellow", "medium", "med", "a", "m"].includes(s)) return "warning";
  if (["green", "ontrack", "on track", "low", "g", "l"].includes(s)) return "ontrack";
  // Fuzzy fallback for values like "High risk" / "Amber/Red"
  if (s.includes("red") || s.includes("crit") || s.includes("high")) return "critical";
  if (s.includes("amber") || s.includes("medium") || s.includes("warn") || s.includes("yellow"))
    return "warning";
  return "ontrack";
}

function normalizeLogStatus(v: unknown): "Open" | "Closed" | "WIP" {
  const s = str(v).toLowerCase();
  if (s === "closed" || s === "done" || s === "completed" || s === "complete") return "Closed";
  if (s === "wip" || s === "in progress" || s === "inprogress") return "WIP";
  return "Open";
}

function normalizeRiskLevel(v: unknown): "High" | "Medium" | "Low" {
  const s = str(v).toLowerCase();
  if (s === "high" || s === "h") return "High";
  if (s === "medium" || s === "med" || s === "m") return "Medium";
  return "Low";
}

function normalizeChecklistStatus(v: unknown): "NS" | "IP" | "D" | "B" {
  const s = str(v).toLowerCase();
  if (s === "d" || s === "done" || s === "completed" || s === "complete") return "D";
  if (s === "ip" || s === "in progress" || s === "inprogress" || s === "wip") return "IP";
  if (s === "b" || s === "blocked" || s === "open") return "B";
  return "NS";
}

function normalizeOwner(v: unknown): "SCB" | "FB" | "Jointly" {
  const s = str(v).toLowerCase();
  if (s.includes("jointly") || s.includes("joint")) return "Jointly";
  if (s.includes("fb") || s.includes("federal")) return "FB";
  if (s.includes("scb") || s.includes("standard")) return "SCB";
  return "Jointly";
}

/**
 * Normalize a heading for comparison: lowercase and collapse every run of
 * whitespace (including in-cell line breaks from Alt+Enter, e.g.
 * "Decision\nDetails") into a single space. This is what makes header matching
 * resilient to the multi-line header cells used in the real KPMG workbooks.
 */
function norm(v: unknown): string {
  return str(v).toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Canonical key used only for Excel headings. Real workbooks may contain
 * line breaks, non-breaking/zero-width spaces, punctuation, or styling
 * artifacts inside a header cell. Removing all non-alphanumeric characters
 * makes "Decision\nArea", "Decision Area", and "Decision-Area" equivalent,
 * while a generic "Decision" heading remains a different key.
 */
function headingKey(v: unknown): string {
  return norm(v).replace(/[^a-z0-9]+/g, "");
}

/** Look up a cell by explicit column aliases (whitespace/case-insensitive). */
function col(row: Record<string, unknown>, ...keys: string[]): unknown {
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    if (k in row) return row[k];
    const expectedKey = headingKey(k);
    const found = rowKeys.find((rowKey) => headingKey(rowKey) === expectedKey);
    if (found) return row[found];
  }
  return "";
}

// ─── Header-aware sheet reader ───────────────────────────────────────
function sheetToAoa(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
}

/** Find the row index that best matches the expected column headings. */
function findHeaderRow(aoa: unknown[][], expected: string[]): number {
  const expectedNorm = expected.map((e) => norm(e));
  let bestRow = 0;
  let bestScore = 0;
  const limit = Math.min(aoa.length, 20);
  for (let i = 0; i < limit; i++) {
    const cells = (aoa[i] || []).map((c) => norm(c));
    let score = 0;
    for (const c of cells) {
      if (!c) continue;
      if (expectedNorm.includes(c))
        score += 2; // exact heading
      else if (expectedNorm.some((e) => e.length >= 4 && (c.includes(e) || e.includes(c))))
        score += 1; // partial heading (handles slight wording differences)
    }
    if (score > bestScore) {
      bestScore = score;
      bestRow = i;
    }
  }
  return bestScore >= 2 ? bestRow : 0;
}

/**
 * Convert a worksheet to row objects, skipping any title/legend banner rows
 * above the real header row.
 */
function readRecords(
  sheet: XLSX.WorkSheet | undefined,
  expected: string[],
): Record<string, unknown>[] {
  if (!sheet) return [];
  const aoa = sheetToAoa(sheet);
  if (aoa.length === 0) return [];
  const headerRow = findHeaderRow(aoa, expected);
  // Collapse in-cell line breaks / double spaces so keys like "Decision\nDetails"
  // become "Decision Details" and match the lookups in the parsers below.
  const headers = (aoa[headerRow] || []).map((h) => str(h).replace(/\s+/g, " "));
  const records: Record<string, unknown>[] = [];
  for (let i = headerRow + 1; i < aoa.length; i++) {
    const row = aoa[i] || [];
    if (row.every((c) => str(c) === "")) continue;
    const rec: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const h = headers[j];
      if (h) rec[h] = row[j] ?? "";
    }
    records.push(rec);
  }
  return records;
}

function pickSheet(wb: XLSX.WorkBook, ...matchers: RegExp[]): XLSX.WorkSheet | undefined {
  for (const re of matchers) {
    const name = wb.SheetNames.find((n) => re.test(n));
    if (name) return wb.Sheets[name];
  }
  return undefined;
}

// ─── Expected column vocabularies (used for header detection) ────────
const EXP_RAG = [
  "sn",
  "s no",
  "s.no",
  "workstream",
  "activity",
  "owner",
  "leads",
  "target date",
  "rag",
];
const EXP_PENDING = ["sn", "s no", "workstream", "activity", "leads", "date raised"];
const EXP_PROGRAM = [
  "sr. no",
  "sr no",
  "sr.no",
  "workstreams",
  "workstream",
  "led by",
  "activity description",
  "owner/s",
  "owner",
  "department",
  "end date",
  "status",
  "month",
];
const EXP_RISK = [
  "s no",
  "sn",
  "workstream",
  "issue/risk detail",
  "mitigation plan",
  "date raised",
  "risk level",
  "status",
];
const EXP_DECISION = ["sn", "workstream", "decision area", "decision details", "owner", "status"];
const EXP_CHECKLIST = [
  "sr.no",
  "sr. no",
  "sr no",
  "task name",
  "task",
  "duration",
  "start",
  "finish",
  "by who",
  "scb/fb/jointly",
  "status",
  "comments",
];

// ─── Per-sheet parsers ───────────────────────────────────────────────
function parseRag(rows: Record<string, unknown>[]): RagItem[] {
  return rows
    .filter(
      (r) =>
        str(col(r, "Activity", "Activity Description")) || str(col(r, "Workstream", "Work Stream")),
    )
    .map((r, i) => ({
      sn: num(col(r, "SN", "S.No", "S No", "sn")) || i + 1,
      workstream: str(col(r, "Workstream", "Work Stream")),
      activity: str(col(r, "Activity", "Activity Description")),
      owner: str(col(r, "Owner", "Owner/s")),
      leads: str(col(r, "Leads", "Lead", "Led by")),
      targetDate: str(col(r, "Target date", "Target Date", "End Date", "Deadline")),
      rag: normalizeRag(col(r, "RAG", "Rag", "Status")),
    }));
}

function parsePending(rows: Record<string, unknown>[]): PendingItem[] {
  return rows
    .filter(
      (r) =>
        str(col(r, "Activity", "Activity Description")) || str(col(r, "Workstream", "Work Stream")),
    )
    .map((r, i) => ({
      sn: num(col(r, "SN", "S.No", "S No", "sn")) || i + 1,
      workstream: str(col(r, "Workstream", "Work Stream")),
      activity: str(col(r, "Activity", "Activity Description")),
      leads: str(col(r, "Leads", "Lead")),
      dateRaised: str(col(r, "Date Raised", "Date raised", "Raised")),
    }));
}

function parseActivities(rows: Record<string, unknown>[]): ActivityItem[] {
  return rows
    .filter((r) => str(col(r, "Activity Description", "Activity", "Milestone")))
    .map((r, i) => {
      const sr = num(col(r, "Sr. No", "Sr.No", "Sr No", "SR", "sr", "SN")) || i + 1;
      return {
        sr,
        displaySr: str(col(r, "Sr. No", "Sr.No", "Sr No", "SR", "sr", "SN")) || String(sr),
        workstream: str(col(r, "Workstreams", "Workstream", "Work Stream")),
        phase: str(col(r, "Phase")),
        ledBy: str(col(r, "Led by", "Led By", "LedBy")),
        activity: str(col(r, "Activity Description", "Activity", "Milestone")),
        owner: str(col(r, "Owner/s", "Owner", "Owners")),
        department: str(col(r, "Department", "Dept")),
        status: str(col(r, "Status")),
        deadline: str(col(r, "End Date", "Deadline", "Target Date")),
        month: str(col(r, "Month")),
      };
    });
}

function parseRisk(rows: Record<string, unknown>[]): RiskLogItem[] {
  return rows
    .filter((r) => str(col(r, "Issue/Risk Detail", "Issue/Risk", "Detail", "Risk Detail")))
    .map((r, i) => ({
      sn: num(col(r, "S No", "SN", "S.No", "sn")) || i + 1,
      workstream: str(col(r, "Workstream", "Work Stream")),
      detail: str(col(r, "Issue/Risk Detail", "Issue/Risk", "Detail", "Risk Detail")),
      mitigation: str(col(r, "Mitigation Plan", "Mitigation", "Mitigation plan")),
      raised: str(col(r, "Date Raised", "Raised")),
      level: normalizeRiskLevel(col(r, "Risk Level", "Level")),
      status: normalizeLogStatus(col(r, "Status")),
    }));
}

function decisionCell(
  row: Record<string, unknown>,
  fallbackIndex: number,
  ...aliases: string[]
): unknown {
  const matched = col(row, ...aliases);
  if (str(matched)) return matched;

  const headings = Object.keys(row);
  const hasExpectedLayout =
    headings.length >= 7 &&
    ["sn", "sno", "srno"].includes(headingKey(headings[0])) &&
    headingKey(headings[1]) === "workstream" &&
    ["owner", "owners"].includes(headingKey(headings[5])) &&
    ["status", "state"].includes(headingKey(headings[6]));

  return hasExpectedLayout && headings[fallbackIndex] ? row[headings[fallbackIndex]] : "";
}

function parseDecision(rows: Record<string, unknown>[]): DecisionLogItem[] {
  return rows
    .filter(
      (r) =>
        str(decisionCell(r, 3, "Decision Details", "Details", "Decision Detail", "Description")) ||
        str(decisionCell(r, 2, "Decision Area", "Area", "Decision area")),
    )
    .map((r, i) => ({
      sn: num(decisionCell(r, 0, "SN", "S.No", "S No", "sn", "Sr. No", "Sr No")) || i + 1,
      workstream: str(decisionCell(r, 1, "Workstream", "Work Stream", "workstream", "Category")),
      area: str(decisionCell(r, 2, "Decision Area", "Area", "area", "Decision area")),
      details: str(
        decisionCell(
          r,
          3,
          "Decision Details",
          "Details",
          "details",
          "Decision Detail",
          "Description",
        ),
      ),
      owner: str(decisionCell(r, 5, "Owner", "Owner/s", "owner", "Owners", "Lead")),
      status: normalizeLogStatus(decisionCell(r, 6, "Status", "status", "State")),
      remarks: str(decisionCell(r, 7, "Remarks", "remarks", "Comment", "Comments")),
    }));
}

function parseChecklistSheet(
  rows: Record<string, unknown>[],
  workstream: string,
  startSn: number,
): ChecklistItem[] {
  return rows
    .filter((r) => {
      const task = str(col(r, "Task Name", "Task", "Activity"));
      if (!task) return false;
      // Skip section/category banner rows that only carry a title with no
      // schedule/owner/status data.
      const hasData =
        str(col(r, "Status")) ||
        str(col(r, "By Who", "By", "Lead")) ||
        str(col(r, "Finish", "End Date")) ||
        str(col(r, "Start")) ||
        str(col(r, "SCB/FB/Jointly", "Owner"));
      return Boolean(hasData);
    })
    .map((r, i) => ({
      sn: startSn + i,
      workstream,
      task: str(col(r, "Task Name", "Task", "Activity")),
      duration: str(col(r, "Duration")),
      start: str(col(r, "Start")),
      finish: str(col(r, "Finish", "End Date")),
      by: str(col(r, "By Who", "By", "Lead")),
      owner: normalizeOwner(col(r, "SCB/FB/Jointly", "Owner")),
      status: normalizeChecklistStatus(col(r, "Status")),
      comments: str(col(r, "Comments", "Remarks")),
    }));
}

// ─── File-type detection ─────────────────────────────────────────────
function detectByName(fileName: string): ModuleType {
  const n = fileName.toLowerCase();
  if (/risk/.test(n)) return "risk";
  if (/decision/.test(n)) return "decision";
  if (/checklist|joint|workstream/.test(n)) return "checklist";
  if (/program|overview/.test(n)) return "program";
  if (/rag/.test(n)) return "rag";
  return "unknown";
}

function detectByContent(wb: XLSX.WorkBook): ModuleType {
  // Gather every heading token that appears in the first 20 rows of any sheet.
  // Use norm() so multi-line cells like "Decision\nDetails" become "decision details".
  const tokens = new Set<string>();
  for (const name of wb.SheetNames) {
    const aoa = sheetToAoa(wb.Sheets[name]);
    for (let i = 0; i < Math.min(aoa.length, 20); i++) {
      for (const c of aoa[i] || []) {
        const t = norm(c);
        if (t) tokens.add(t);
      }
    }
  }
  const has = (...t: string[]) => t.some((x) => tokens.has(x));
  if (has("issue/risk detail", "mitigation plan", "risk level")) return "risk";
  if (has("decision area", "decision details")) return "decision";
  if (has("scb/fb/jointly", "task name", "by who")) return "checklist";
  if (has("activity description", "led by", "owner/s")) return "program";
  if (has("rag")) return "rag";
  return "unknown";
}

// ─── Single-file parser ──────────────────────────────────────────────
function parseFile(
  fileName: string,
  buffer: Uint8Array,
): { data: Partial<DashboardData>; summary: FileSummary } {
  const wb = XLSX.read(buffer, { type: "array" });
  let type = detectByName(fileName);
  if (type === "unknown") type = detectByContent(wb);

  const data: Partial<DashboardData> = {};
  const modules: (keyof DashboardData)[] = [];

  switch (type) {
    case "rag": {
      const ragSheet = pickSheet(wb, /^rag/i, /rag/i) ?? wb.Sheets[wb.SheetNames[0]];
      const tsysSheet = pickSheet(wb, /tsys/i, /pending/i);
      const ragSummary = parseRag(readRecords(ragSheet, EXP_RAG));
      const pendingFromTsys = parsePending(readRecords(tsysSheet, EXP_PENDING));
      if (ragSummary.length) {
        data.ragSummary = ragSummary;
        modules.push("ragSummary");
      }
      if (pendingFromTsys.length) {
        data.pendingFromTsys = pendingFromTsys;
        modules.push("pendingFromTsys");
      }
      break;
    }
    case "program": {
      // Prefer the sheet that actually contains programme columns.
      let sheet = wb.Sheets[wb.SheetNames[0]];
      for (const name of wb.SheetNames) {
        const aoa = sheetToAoa(wb.Sheets[name]);
        const found = aoa.slice(0, 20).some((row) =>
          (row || []).some((c) => {
            const t = str(c).toLowerCase();
            return t === "activity description" || t === "led by";
          }),
        );
        if (found) {
          sheet = wb.Sheets[name];
          break;
        }
      }
      const activities = parseActivities(readRecords(sheet, EXP_PROGRAM));
      if (activities.length) {
        data.activities = activities;
        modules.push("activities");
      }
      break;
    }
    case "checklist": {
      const checklist: ChecklistItem[] = [];
      for (const name of wb.SheetNames) {
        const rows = readRecords(wb.Sheets[name], EXP_CHECKLIST);
        const items = parseChecklistSheet(rows, name.trim(), checklist.length + 1);
        checklist.push(...items);
      }
      if (checklist.length) {
        data.checklist = checklist;
        modules.push("checklist");
      }
      break;
    }
    case "risk": {
      const sheet = pickSheet(wb, /risk/i) ?? wb.Sheets[wb.SheetNames[0]];
      const riskLogs = parseRisk(readRecords(sheet, EXP_RISK));
      if (riskLogs.length) {
        data.riskLogs = riskLogs;
        modules.push("riskLogs");
      }
      break;
    }
    case "decision": {
      // A workbook can contain several decision-related sheets. Do not stop at
      // the first name match: e.g. "Decision_Log" may use a different export
      // schema while a later "Decision" sheet contains the dashboard columns.
      // Parse every sheet and use the strongest dashboard-shaped result.
      let decisionLogs: DecisionLogItem[] = [];
      for (const name of wb.SheetNames) {
        const candidate = parseDecision(readRecords(wb.Sheets[name], EXP_DECISION));
        if (candidate.length > decisionLogs.length) decisionLogs = candidate;
      }
      if (decisionLogs.length) {
        data.decisionLogs = decisionLogs;
        modules.push("decisionLogs");
      }
      break;
    }
  }

  const rows = Object.values(data).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
  return {
    data,
    summary: { fileName, type, label: MODULE_LABEL[type], rows, modules },
  };
}

// ─── Public entry point ──────────────────────────────────────────────
export function parseUploadedModuleFiles(
  files: { fileName: string; buffer: Uint8Array }[],
): ParsedUpload {
  const merged: Partial<DashboardData> = {};
  const summary: FileSummary[] = [];

  for (const { fileName, buffer } of files) {
    const { data, summary: fileSummary } = parseFile(fileName, buffer);
    Object.assign(merged, data);
    summary.push(fileSummary);
  }

  const totalRows = Object.values(merged).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
  return { data: merged, summary, totalRows };
}
