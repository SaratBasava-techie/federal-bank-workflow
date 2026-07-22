import type { DashboardData, DashboardResponse } from "./dashboard-server-fn";

export type ModuleKey = keyof DashboardData;

const STORAGE_KEY = "soulfire-excel-overrides-v1";

/**
 * Per-module overrides sourced from uploaded Excel files. Each key that is
 * present replaces that module's data; modules that were never uploaded fall
 * back to the server/default data. Overrides are persisted to localStorage so
 * they survive page reloads ("replace + remember").
 */
type Overrides = Partial<DashboardData>;

function loadOverrides(): Overrides {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
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
