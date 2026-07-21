import { createServerFn } from "@tanstack/react-start";

const MAX_DASHBOARD_WORKBOOK_BYTES = 20 * 1024 * 1024;

/**
 * Accepts one multi-sheet dashboard workbook from the frontend and parses it
 * on the server. The parsed records are returned to the browser for display;
 * the uploaded file is not persisted.
 */
export const parseUploadedDashboardExcel = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = input as { fileName?: string; data?: string };
    if (!body.fileName || !body.data) {
      throw new Error("Choose an Excel file before submitting.");
    }
    if (!/\.xlsx?$/i.test(body.fileName)) {
      throw new Error("Only .xlsx and .xls Excel files are supported.");
    }
    return { fileName: body.fileName, data: body.data };
  })
  .handler(async ({ data: { fileName, data } }) => {
    const fileBuffer = Buffer.from(data, "base64");
    if (fileBuffer.byteLength === 0) {
      throw new Error("The selected Excel file is empty.");
    }
    if (fileBuffer.byteLength > MAX_DASHBOARD_WORKBOOK_BYTES) {
      throw new Error("The Excel file is larger than the 20 MB upload limit.");
    }

    const { parseUploadedDashboardWorkbook } = await import("../server/onedrive-excel");
    const result = parseUploadedDashboardWorkbook(fileBuffer);
    const totalRows = Object.values(result.counts).reduce((total, count) => total + count, 0);
    const moduleCount = [
      result.counts.ragSummary + result.counts.pendingFromTsys,
      result.counts.programOverview,
      result.counts.jointChecklist,
      result.counts.riskLog,
      result.counts.decisionLog,
    ].filter((count) => count > 0).length;

    if (totalRows === 0) {
      throw new Error(
        "No dashboard data was found. Check the workbook sheet names and column headings.",
      );
    }

    console.log(`[Upload] Parsed ${fileName}: ${totalRows} dashboard rows`);
    return { ...result, fileName, totalRows, moduleCount };
  });

/**
 * Server function that accepts Excel file uploads from Power Automate.
 * Secured with an API_UPLOAD_KEY environment variable.
 *
 * Usage from Power Automate HTTP action:
 *   POST https://<your-domain>/_server/?_serverFnId=uploadExcelFile&_serverFnMethod=POST
 *   Headers: { "Content-Type": "application/json", "X-API-KEY": "<your-secret>" }
 *   Body: { "type": "rag", "data": "<base64-encoded file content>" }
 */
export const uploadExcelFile = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = input as { type?: string; data?: string; apiKey?: string };
    if (!body.type || !body.data || !body.apiKey) {
      throw new Error("Missing required fields: type, data, apiKey");
    }
    const validTypes = ["rag", "program", "checklist", "risk", "decision"];
    if (!validTypes.includes(body.type)) {
      throw new Error(`Invalid type '${body.type}'. Must be one of: ${validTypes.join(", ")}`);
    }
    return body as { type: string; data: string; apiKey: string };
  })
  .handler(async ({ data: { type, data, apiKey } }) => {
    // 1. Verify API Key
    const configuredKey = process.env.API_UPLOAD_KEY;
    if (!configuredKey || apiKey !== configuredKey) {
      throw new Error("Unauthorized. Invalid API key.");
    }

    // 2. Dynamic import of fs/path (server-only)
    const fs = await import("fs");
    const path = await import("path");

    // 3. Ensure 'data' directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 4. Map type to filename
    const fileMap: Record<string, string> = {
      rag: "RAG.xlsx",
      program: "Program.xlsx",
      checklist: "Checklist.xlsx",
      risk: "Risk.xlsx",
      decision: "Decision.xlsx",
    };
    const targetFileName = fileMap[type];
    const targetPath = path.join(dataDir, targetFileName);

    // 5. Decode base64 and save
    const buffer = Buffer.from(data, "base64");
    fs.writeFileSync(targetPath, buffer);

    console.log(`[Upload] Saved ${targetFileName} (${buffer.byteLength} bytes)`);

    return {
      success: true,
      file: targetFileName,
      bytes: buffer.byteLength,
    };
  });
