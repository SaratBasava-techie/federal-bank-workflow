import fs from "fs";
import os from "os";
import path from "path";
import type { DashboardData } from "./onedrive-excel";

// ─────────────────────────────────────────────────────────────────────
// Server-side store for the latest uploaded dashboard data.
//
// The parsed result of an Excel upload is written to a JSON file on the
// server so that EVERY visitor sees the same data — not just the browser
// that performed the upload. Overrides accumulate per module, so uploading
// only some files leaves the other modules untouched.
//
// NOTE: this is the container's local filesystem. On a stateless host
// (e.g. Cloud Run) it is shared across all users hitting the same running
// instance, but it is wiped on redeploy / cold start / scale-out. That is
// the trade-off of keeping everything "in the backend" with no external
// database or bucket.
// ─────────────────────────────────────────────────────────────────────

const FILE_NAME = "dashboard-overrides.json";

/** Pick a writable directory for the overrides file. */
function resolveStoreDir(): string {
  const candidates = [
    process.env.DASHBOARD_DATA_DIR,
    path.join(process.cwd(), "data"),
    path.join(os.tmpdir(), "soulfire-dashboard"),
  ].filter((c): c is string => Boolean(c));

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      // Confirm we can actually write here.
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      /* try the next candidate */
    }
  }
  // Last resort — the OS temp dir itself is essentially always writable.
  return os.tmpdir();
}

function storeFilePath(): string {
  return path.join(resolveStoreDir(), FILE_NAME);
}

/** Read the persisted overrides. Returns {} when nothing is stored yet. */
export function readStoredOverrides(): Partial<DashboardData> {
  try {
    const filePath = storeFilePath();
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw) as Partial<DashboardData>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("[DashboardStore] Failed to read overrides:", error);
    return {};
  }
}

/**
 * Merge freshly parsed module data into the persisted overrides and write it
 * back. Returns the merged overrides.
 */
export function mergeStoredOverrides(partial: Partial<DashboardData>): Partial<DashboardData> {
  const merged: Partial<DashboardData> = { ...readStoredOverrides(), ...partial };
  try {
    fs.writeFileSync(storeFilePath(), JSON.stringify(merged), "utf-8");
    console.log(
      `[DashboardStore] Saved overrides for modules: ${Object.keys(partial).join(", ") || "(none)"}`,
    );
  } catch (error) {
    console.error("[DashboardStore] Failed to write overrides:", error);
  }
  return merged;
}

/** Remove all persisted overrides (revert everyone to default data). */
export function clearStoredOverrides(): void {
  try {
    const filePath = storeFilePath();
    if (fs.existsSync(filePath)) fs.rmSync(filePath);
  } catch (error) {
    console.error("[DashboardStore] Failed to clear overrides:", error);
  }
}
