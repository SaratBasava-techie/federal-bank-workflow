import { createServerFn } from "@tanstack/react-start";

const MAX_DASHBOARD_WORKBOOK_BYTES = 20 * 1024 * 1024;
const MAX_UPLOAD_FILES = 10;

/**
 * Accepts multiple dashboard workbooks (RAG, Program Overview, Joint
 * Workstream Checklist, Risk Log, Decision Log) in a single request and
 * parses them on the server. Each file maps to one dashboard module; only
 * the modules that parse successfully are returned so the browser can keep
 * showing existing data for any module the user did not upload.
 */
export const parseUploadedDashboardFiles = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = input as { files?: { fileName?: string; data?: string }[] };
    if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
      throw new Error("Choose at least one Excel file before submitting.");
    }
    if (body.files.length > MAX_UPLOAD_FILES) {
      throw new Error(`You can upload at most ${MAX_UPLOAD_FILES} files at once.`);
    }
    for (const file of body.files) {
      if (!file.fileName || !file.data) {
        throw new Error("Each uploaded file needs a name and content.");
      }
      if (!/\.xlsx?$/i.test(file.fileName)) {
        throw new Error(`Only .xlsx and .xls Excel files are supported (got "${file.fileName}").`);
      }
    }
    return { files: body.files as { fileName: string; data: string }[] };
  })
  .handler(async ({ data: { files } }) => {
    const buffers = files.map(({ fileName, data }) => {
      const buffer = Buffer.from(data, "base64");
      if (buffer.byteLength === 0) {
        throw new Error(`"${fileName}" is empty.`);
      }
      if (buffer.byteLength > MAX_DASHBOARD_WORKBOOK_BYTES) {
        throw new Error(`"${fileName}" is larger than the 20 MB upload limit.`);
      }
      return { fileName, buffer };
    });

    const { parseUploadedModuleFiles } = await import("../server/excel-parsing");
    const result = parseUploadedModuleFiles(buffers);

    if (result.totalRows === 0) {
      throw new Error(
        "No dashboard data was found in the uploaded files. Check the sheet names and column headings.",
      );
    }

    // Persist the parsed data on the server so every visitor sees it, not just
    // the browser that uploaded. Failure to persist must not fail the upload.
    try {
      const { mergeStoredOverrides } = await import("../server/dashboard-store");
      mergeStoredOverrides(result.data);
    } catch (error) {
      console.error("[Upload] Failed to persist parsed data:", error);
    }

    console.log(
      `[Upload] Parsed ${files.length} file(s): ${result.totalRows} rows across ` +
        `${result.summary.filter((s) => s.rows > 0).length} module(s)`,
    );
    return result;
  });

/**
 * Clears the server-stored uploaded data so every visitor reverts to the
 * built-in default dataset. This backs the "Reset Uploaded Data" button.
 */
export const clearUploadedDashboardData = createServerFn({ method: "POST" }).handler(async () => {
  const { clearStoredOverrides } = await import("../server/dashboard-store");
  clearStoredOverrides();
  console.log("[Upload] Cleared stored dashboard overrides (reverted to default)");
  return { success: true };
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
