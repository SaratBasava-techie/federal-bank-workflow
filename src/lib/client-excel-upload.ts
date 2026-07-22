import type { DashboardData, DashboardResponse } from "./dashboard-server-fn";

export type ModuleKey = keyof DashboardData;

const STORAGE_KEY = "soulfire-excel-overrides-v2";
const LEGACY_STORAGE_KEY = "soulfire-excel-overrides-v1";

/**
 * Per-module overrides sourced from uploaded Excel files. Each key that is
 * present replaces that module's data; modules that were never uploaded fall
 * back to the server/default data. Overrides are persisted to localStorage so
 * they survive page reloads ("replace + remember").
 */
type Overrides = Partial<DashboardData>;

function isDecisionLogValid(logs: any[]): boolean {
  if (!Array.isArray(logs) || logs.length === 0) return false;
  // If all rows are missing details or contain known mismatched checklist strings, mark invalid
  const hasValidDetails = logs.some((r) => r && typeof r.details === "string" && r.details.trim().length > 0);
  const hasBadChecklistText = logs.some(
    (r) => r && (String(r.area).includes("audit readiness") || String(r.details).includes("audit readiness")),
  );
  return hasValidDetails && !hasBadChecklistText;
}

function loadOverrides(): Overrides {
  if (typeof localStorage === "undefined") return {};
  try {
    // Clear legacy corrupted v1 storage if present
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Overrides;
    // Validate decisionLogs if present
    if (parsed.decisionLogs && !isDecisionLogValid(parsed.decisionLogs)) {
      delete parsed.decisionLogs;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveOverrides(next: Overrides) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable — keep the in-memory copy */
  }
}

let overrides: Overrides = loadOverrides();

/** Merge freshly parsed module data into the persisted overrides. */
export function applyClientExcelOverrides(partial: Overrides) {
  overrides = { ...overrides, ...partial };
  saveOverrides(overrides);
}

export function clearClientExcelOverrides() {
  overrides = {};
  saveOverrides(overrides);
}

export function hasClientExcelOverrides() {
  return Object.keys(overrides).length > 0;
}

export function getClientExcelOverrideKeys(): ModuleKey[] {
  return Object.keys(overrides) as ModuleKey[];
}

/** Overlay any uploaded module data on top of the server response. */
export function mergeClientExcelData(response: DashboardResponse): DashboardResponse {
  if (Object.keys(overrides).length === 0) return response;
  return {
    ...response,
    data: { ...response.data, ...overrides },
    isConnected: true,
  };
}
