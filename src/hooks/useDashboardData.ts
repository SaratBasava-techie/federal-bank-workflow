import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../lib/dashboard-server-fn";
import type { DashboardResponse } from "../lib/dashboard-server-fn";

// Re-export types for convenience
export type {
  DashboardData,
  DashboardResponse,
  RagItem,
  PendingItem,
  ActivityItem,
  RiskLogItem,
  DecisionLogItem,
  ChecklistItem,
} from "../lib/dashboard-server-fn";

const POLL_INTERVAL = 10_000; // 10 seconds

/**
 * Custom React hook that fetches live dashboard data from the server
 * and automatically re-fetches every 10 seconds in the background.
 *
 * The data updates seamlessly without a page reload.
 */
export function useDashboardData() {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard-data"],
    // The server is the single source of truth: getDashboardData already
    // overlays any uploaded data (persisted server-side) so every visitor sees
    // it on refresh. We intentionally do NOT overlay this browser's localStorage
    // here — doing so would mask another machine's fresh upload.
    queryFn: () => getDashboardData(),
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false, // Only poll when tab is visible
    staleTime: 5_000, // Consider data stale after 5 seconds
    retry: 2,
  });
}
