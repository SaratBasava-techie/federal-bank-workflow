import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────
export interface RagItem {
  sn: number;
  workstream: string;
  activity: string;
  owner: string;
  leads: string;
  targetDate: string;
  rag: "critical" | "warning" | "ontrack";
}

export interface PendingItem {
  sn: number;
  workstream: string;
  activity: string;
  leads: string;
  dateRaised: string;
}

export interface ActivityItem {
  sr: number;
  displaySr: string;
  workstream: string;
  phase: string;
  ledBy: string;
  activity: string;
  owner: string;
  department: string;
  status: string;
  deadline: string;
  month: string;
}

export interface RiskLogItem {
  sn: number;
  workstream: string;
  detail: string;
  mitigation: string;
  raised: string;
  level: "High" | "Medium" | "Low";
  status: "Open" | "Closed" | "WIP";
}

export interface DecisionLogItem {
  sn: number;
  workstream: string;
  area: string;
  details: string;
  owner: string;
  status: "Open" | "Closed" | "WIP";
}

export interface ChecklistItem {
  sn: number;
  workstream: string;
  task: string;
  duration: string;
  start: string;
  finish: string;
  by: string;
  owner: "SCB" | "FB" | "Jointly";
  status: "NS" | "IP" | "D" | "B";
  comments: string;
}

export interface DashboardData {
  ragSummary: RagItem[];
  pendingFromTsys: PendingItem[];
  activities: ActivityItem[];
  riskLogs: RiskLogItem[];
  decisionLogs: DecisionLogItem[];
  checklist: ChecklistItem[];
}

// ─── OneDrive / SharePoint URL Conversion ────────────────────────────
function onedriveShareToDirectUrl(shareUrl: string): string {
  const trimmed = shareUrl.trim();

  // Already a direct download link
  if (trimmed.includes("download.aspx") || trimmed.includes("&download=1")) {
    return trimmed;
  }

  // SharePoint / OneDrive for Business links
  if (trimmed.includes("sharepoint.com") || trimmed.includes("sharepoint.us")) {
    try {
      const url = new URL(trimmed);

      // Pattern 1: /:x:/g/personal/... sharing link (e.g. .xlsx file shared via "Copy link")
      // These contain the file type indicator like /:x:/ for Excel
      const sharingMatch = url.pathname.match(/\/:([a-z]):\/([a-z])\/(.+)/i);
      if (sharingMatch) {
        url.searchParams.set("download", "1");
        return url.toString();
      }

      // Pattern 2: _layouts/15/onedrive.aspx?id=... (folder or file link from browser)
      // The 'id' param contains the full server-relative path to the file/folder
      const idParam = url.searchParams.get("id");
      if (idParam && (idParam.endsWith(".xlsx") || idParam.endsWith(".xls"))) {
        // Build a direct download URL from the file path
        const downloadUrl = `${url.origin}${idParam}`;
        return downloadUrl;
      }

      // Pattern 3: Direct file link — just append download=1
      url.searchParams.set("download", "1");
      return url.toString();
    } catch {
      // If URL parsing fails, return as-is
      return trimmed;
    }
  }

  // Personal OneDrive sharing link (1drv.ms or onedrive.live.com) — base64 encode
  const base64 = Buffer.from(trimmed, "utf-8").toString("base64");
  const encoded = "u!" + base64.replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "");
  return `https://api.onedrive.com/v1.0/shares/${encoded}/root/content`;
}

let cachedToken: { token: string; expires: number } | null = null;

async function getMicrosoftGraphAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) {
    return cachedToken.token;
  }

  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing Microsoft Entra ID configuration (tenant ID, client ID, or client secret)");
  }

  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to retrieve Entra ID access token: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const expires = Date.now() + (Number(data.expires_in) - 60) * 1000; // subtract 1 min buffer
  cachedToken = { token: data.access_token, expires };
  return data.access_token;
}

function encodeShareUrl(shareUrl: string): string {
  const base64 = Buffer.from(shareUrl.trim(), "utf-8").toString("base64");
  return "u!" + base64.replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "");
}

// ─── Fetch Excel Buffer ──────────────────────────────────────────────
async function fetchExcelBuffer(shareUrl: string): Promise<ArrayBuffer> {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  // Use Microsoft Graph API if OAuth credentials are provided
  if (tenantId && clientId && clientSecret) {
    try {
      const token = await getMicrosoftGraphAccessToken();
      const shareId = encodeShareUrl(shareUrl);
      const graphUrl = `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/content`;

      const res = await fetch(graphUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Graph API returned error: ${res.status} ${res.statusText} (${errText})`);
      }

      return res.arrayBuffer();
    } catch (e: any) {
      console.warn(`[OneDrive Secure Auth] secure fetch failed, falling back to public download path:`, e.message || e);
    }
  }

  const directUrl = onedriveShareToDirectUrl(shareUrl);
  const res = await fetch(directUrl, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Failed to fetch Excel from OneDrive: ${res.status} ${res.statusText} (${directUrl})`);
  }
  return res.arrayBuffer();
}

// ─── Helpers ─────────────────────────────────────────────────────────
function readSheet(workbook: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    // Try case-insensitive match
    const key = Object.keys(workbook.Sheets).find(
      (k) => k.toLowerCase().trim() === sheetName.toLowerCase().trim(),
    );
    if (!key) return [];
    return XLSX.utils.sheet_to_json(workbook.Sheets[key], { defval: "" });
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

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
  if (s === "red" || s === "critical" || s === "r") return "critical";
  if (s === "amber" || s === "warning" || s === "yellow" || s === "a") return "warning";
  return "ontrack";
}

function normalizeLogStatus(v: unknown): "Open" | "Closed" | "WIP" {
  const s = str(v).toLowerCase();
  if (s === "closed" || s === "done" || s === "completed") return "Closed";
  if (s === "wip" || s === "in progress") return "WIP";
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
  if (s === "ip" || s === "in progress" || s === "wip") return "IP";
  if (s === "b" || s === "blocked") return "B";
  return "NS";
}

function normalizeOwner(v: unknown): "SCB" | "FB" | "Jointly" {
  const s = str(v).toLowerCase();
  if (s.includes("jointly") || s.includes("joint")) return "Jointly";
  if (s.includes("fb") || s.includes("federal")) return "FB";
  if (s.includes("scb") || s.includes("standard")) return "SCB";
  // Fallback based on first match
  return "Jointly";
}

// Column name lookup helper — finds a value by trying multiple possible column names
function col(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    // Exact match
    if (k in row) return row[k];
    // Case-insensitive match
    const found = Object.keys(row).find((rk) => rk.toLowerCase().trim() === k.toLowerCase().trim());
    if (found) return row[found];
  }
  return "";
}

// ─── Parsers ─────────────────────────────────────────────────────────

function parseRagSheet(rows: Record<string, unknown>[]): RagItem[] {
  return rows
    .filter((r) => col(r, "SN", "S.No", "S No", "sn"))
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

function parsePendingSheet(rows: Record<string, unknown>[]): PendingItem[] {
  return rows
    .filter((r) => col(r, "SN", "S.No", "S No", "sn"))
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
    .filter((r) => col(r, "Sr. No", "Sr.No", "SR", "sr", "SN"))
    .map((r, i) => {
      const sr = num(col(r, "Sr. No", "Sr.No", "SR", "sr", "SN")) || i + 1;
      return {
        sr,
        displaySr: str(col(r, "Sr. No", "Sr.No", "SR", "sr", "SN")) || String(sr),
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

function parseRiskLog(rows: Record<string, unknown>[]): RiskLogItem[] {
  return rows
    .filter((r) => col(r, "S No", "SN", "S.No", "sn"))
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

function parseDecisionLog(rows: Record<string, unknown>[]): DecisionLogItem[] {
  return rows
    .filter((r) => col(r, "SN", "S.No", "S No", "sn"))
    .map((r, i) => ({
      sn: num(col(r, "SN", "S.No", "S No", "sn")) || i + 1,
      workstream: str(col(r, "Workstream", "Work Stream")),
      area: str(col(r, "Decision Area", "Area")),
      details: str(col(r, "Decision Details", "Details")),
      owner: str(col(r, "Owner", "Owner/s")),
      status: normalizeLogStatus(col(r, "Status")),
    }));
}

function parseChecklistSheet(
  rows: Record<string, unknown>[],
  workstream: string,
  startSn: number,
): ChecklistItem[] {
  return rows
    .filter((r) => str(col(r, "Task Name", "Task", "Activity")).length > 0)
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

// ─── Local File Helper ───────────────────────────────────────────────
async function fetchLocalFileBuffer(fileName: string): Promise<ArrayBuffer> {
  const filePath = path.join(process.cwd(), "data", fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Local file not found at ${filePath}.`);
  }
  const buf = fs.readFileSync(filePath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

// ─── Main Fetch Function ─────────────────────────────────────────────

export async function fetchDashboardDataFromOneDrive(): Promise<DashboardData> {
  const useLocal = process.env.USE_LOCAL_FILES === "true";

  let ragBuf: ArrayBuffer | null = null;
  let programBuf: ArrayBuffer | null = null;
  let checklistBuf: ArrayBuffer | null = null;
  let riskBuf: ArrayBuffer | null = null;
  let decisionBuf: ArrayBuffer | null = null;

  if (useLocal) {
    console.log("[DashboardData] Loading live data from local 'data/' directory");
    const [b1, b2, b3, b4, b5] = await Promise.all([
      fetchLocalFileBuffer("RAG.xlsx").catch(() => null),
      fetchLocalFileBuffer("Program.xlsx").catch(() => null),
      fetchLocalFileBuffer("Checklist.xlsx").catch(() => null),
      fetchLocalFileBuffer("Risk.xlsx").catch(() => null),
      fetchLocalFileBuffer("Decision.xlsx").catch(() => null),
    ]);
    ragBuf = b1;
    programBuf = b2;
    checklistBuf = b3;
    riskBuf = b4;
    decisionBuf = b5;
  } else {
    const ragUrl = process.env.ONEDRIVE_RAG_URL;
    const programUrl = process.env.ONEDRIVE_PROGRAM_URL;
    const checklistUrl = process.env.ONEDRIVE_CHECKLIST_URL;
    const riskUrl = process.env.ONEDRIVE_RISK_URL;
    const decisionUrl = process.env.ONEDRIVE_DECISION_URL;

    const [b1, b2, b3, b4, b5] = await Promise.all([
      ragUrl ? fetchExcelBuffer(ragUrl) : null,
      programUrl ? fetchExcelBuffer(programUrl) : null,
      checklistUrl ? fetchExcelBuffer(checklistUrl) : null,
      riskUrl ? fetchExcelBuffer(riskUrl) : null,
      decisionUrl ? fetchExcelBuffer(decisionUrl) : null,
    ]);
    ragBuf = b1;
    programBuf = b2;
    checklistBuf = b3;
    riskBuf = b4;
    decisionBuf = b5;
  }

  // Parse RAG.xlsx → Sheet "RAG" + Sheet "TSYS ACTIVITIES"
  let ragSummary: RagItem[] = [];
  let pendingFromTsys: PendingItem[] = [];
  if (ragBuf) {
    const wb = XLSX.read(new Uint8Array(ragBuf), { type: "array" });
    ragSummary = parseRagSheet(readSheet(wb, "RAG"));
    // Try multiple possible sheet names for the TSYS activities
    const tsysRows =
      readSheet(wb, "TSYS ACTIVITIES") ||
      readSheet(wb, "TSYS") ||
      readSheet(wb, "Sheet2");
    pendingFromTsys = parsePendingSheet(tsysRows.length ? tsysRows : []);
  }

  // Parse Program Overview.xlsx → First sheet
  let activities: ActivityItem[] = [];
  if (programBuf) {
    const wb = XLSX.read(new Uint8Array(programBuf), { type: "array" });
    const sheetName = wb.SheetNames[0] || "Sheet1";
    activities = parseActivities(readSheet(wb, sheetName));
  }

  // Parse Joint Checklist.xlsx → Multiple sheets
  let checklist: ChecklistItem[] = [];
  if (checklistBuf) {
    const wb = XLSX.read(new Uint8Array(checklistBuf), { type: "array" });
    const checklistSheets = [
      "Product",
      "Comms & Marketing",
      "IT",
      "Operations",
      "KYC & DD",
      "Customer Service",
    ];
    let snCounter = 1;
    for (const sheetName of checklistSheets) {
      const rows = readSheet(wb, sheetName);
      if (rows.length > 0) {
        const items = parseChecklistSheet(rows, sheetName, snCounter);
        checklist.push(...items);
        snCounter += items.length;
      }
    }
  }

  // Parse Risk Log.xlsx → First sheet
  let riskLogs: RiskLogItem[] = [];
  if (riskBuf) {
    const wb = XLSX.read(new Uint8Array(riskBuf), { type: "array" });
    const sheetName = wb.SheetNames[0] || "Sheet1";
    riskLogs = parseRiskLog(readSheet(wb, sheetName));
  }

  // Parse Decision Log.xlsx → First sheet
  let decisionLogs: DecisionLogItem[] = [];
  if (decisionBuf) {
    const wb = XLSX.read(new Uint8Array(decisionBuf), { type: "array" });
    const sheetName = wb.SheetNames[0] || "Sheet1";
    decisionLogs = parseDecisionLog(readSheet(wb, sheetName));
  }

  return {
    ragSummary,
    pendingFromTsys,
    activities,
    riskLogs,
    decisionLogs,
    checklist,
  };
}
