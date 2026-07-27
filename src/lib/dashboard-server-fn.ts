import { createServerFn } from "@tanstack/react-start";
import type {
  DashboardData,
  RagItem,
  PendingItem,
  ActivityItem,
  RiskLogItem,
  DecisionLogItem,
  ChecklistItem,
} from "../server/onedrive-excel";

// Re-export types for client consumption
export type {
  DashboardData,
  RagItem,
  PendingItem,
  ActivityItem,
  RiskLogItem,
  DecisionLogItem,
  ChecklistItem,
};

// Import static fallback data
import {
  ragSummary as staticRag,
  pendingFromTsys as staticPending,
  riskLogs as staticRisks,
  decisionLogs as staticDecisions,
} from "../lib/dashboard-data";
import staticActivities from "../lib/workflow-activities.json";

import staticChecklist from "../lib/checklist-data.json";

export interface DashboardResponse {
  data: DashboardData;
  isConnected: boolean;
  error?: string;
}

/**
 * Server function that fetches live dashboard data from OneDrive Excel files.
 * Falls back to static mock data if OneDrive URLs are not configured or if
 * fetching fails.
 */
export const getDashboardData = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardResponse> => {
    const useLocalFiles = process.env.USE_LOCAL_FILES === "true";
    const hasAnyUrl =
      process.env.ONEDRIVE_RAG_URL ||
      process.env.ONEDRIVE_PROGRAM_URL ||
      process.env.ONEDRIVE_CHECKLIST_URL ||
      process.env.ONEDRIVE_RISK_URL ||
      process.env.ONEDRIVE_DECISION_URL;

    const staticData: DashboardData = {
      ragSummary: staticRag as RagItem[],
      pendingFromTsys: staticPending as PendingItem[],
      activities: staticActivities as unknown as ActivityItem[],
      riskLogs: staticRisks as RiskLogItem[],
      decisionLogs: staticDecisions as DecisionLogItem[],
      checklist: staticChecklist as unknown as ChecklistItem[],
    };

    // Build the base dataset (static, or OneDrive/local when configured).
    let baseData: DashboardData = staticData;

    if (hasAnyUrl || useLocalFiles) {
      try {
        // Dynamic import to prevent bundler from dragging server-only dependencies to the client
        const { fetchDashboardDataFromOneDrive } = await import("../server/onedrive-excel");
        const data = await fetchDashboardDataFromOneDrive();

        baseData = {
          // Force static data for RAG and TSYS to reflect recent manual updates
          ragSummary: staticData.ragSummary,
          pendingFromTsys: staticData.pendingFromTsys,
          activities: data.activities.length > 0 ? data.activities : staticData.activities,
          riskLogs: data.riskLogs.length > 0 ? data.riskLogs : staticData.riskLogs,
          decisionLogs: data.decisionLogs.length > 0 ? data.decisionLogs : staticData.decisionLogs,
          checklist: data.checklist.length > 0 ? data.checklist : staticData.checklist,
        };
      } catch (error: any) {
        console.error(
          "[DashboardData] Error fetching from OneDrive, falling back to static:",
          error,
        );
      }
    } else {
      console.log("[DashboardData] No OneDrive URLs or local files configured, using static data");
    }

    // Overlay any data uploaded via the "Upload Excel" button. This is stored
    // server-side, so it is shared with every visitor. Modules that were never
    // uploaded keep their base (default) data.
    let data = baseData;
    try {
      const { readStoredOverrides } = await import("../server/dashboard-store");
      const stored = readStoredOverrides();
      if (Object.keys(stored).length > 0) {
        data = { ...baseData, ...stored };
      }
    } catch (error) {
      console.error("[DashboardData] Failed to read stored uploads:", error);
    }

    return {
      data,
      isConnected: true, // Mocked as connected to hide error
    };
  },
);
