import type { DashboardData, DashboardResponse } from "./dashboard-server-fn";

let uploadedDashboardData: DashboardData | null = null;

export function applyClientExcelOverride(data: DashboardData) {
  uploadedDashboardData = data;
}

export function clearClientExcelOverrides() {
  uploadedDashboardData = null;
}

export function hasClientExcelOverrides() {
  return uploadedDashboardData !== null;
}

export function mergeClientExcelData(response: DashboardResponse): DashboardResponse {
  if (!uploadedDashboardData) return response;
  return {
    ...response,
    data: uploadedDashboardData,
    isConnected: true,
  };
}
