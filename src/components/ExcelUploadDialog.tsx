import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DashboardResponse } from "@/lib/dashboard-server-fn";
import {
  applyClientExcelOverrides,
  clearClientExcelOverrides,
  hasClientExcelOverrides,
  mergeClientExcelData,
} from "@/lib/client-excel-upload";
import { parseUploadedDashboardFiles } from "@/lib/upload-server-fn";

interface FileSummary {
  fileName: string;
  type: string;
  label: string;
  rows: number;
  modules: string[];
}

type UploadStatus =
  | { kind: "idle" }
  | { kind: "reading"; message: string }
  | { kind: "processing"; message: string }
  | { kind: "success"; message: string; summary: FileSummary[] }
  | { kind: "error"; message: string };

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`"${file.name}" could not be read.`));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error(`"${file.name}" could not be read.`));
        return;
      }
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}

export function ExcelUploadDialog() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>({ kind: "idle" });
  const [hasOverride, setHasOverride] = useState(hasClientExcelOverrides());
  const isBusy = status.kind === "reading" || status.kind === "processing";

  const resetForm = () => {
    setSelectedFiles([]);
    setStatus({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setStatus({ kind: "error", message: "Choose one or more Excel files before submitting." });
      return;
    }

    try {
      setStatus({ kind: "reading", message: "Reading the selected files…" });
      const files = await Promise.all(
        selectedFiles.map(async (file) => ({
          fileName: file.name,
          data: await readFileAsBase64(file),
        })),
      );

      setStatus({
        kind: "processing",
        message: "Uploaded. The backend is parsing your workbooks…",
      });
      const result = await parseUploadedDashboardFiles({ data: { files } });

      applyClientExcelOverrides(result.data);
      queryClient.setQueryData<DashboardResponse>(["dashboard-data"], (current) =>
        current ? mergeClientExcelData(current) : current,
      );
      setHasOverride(true);

      const parsedFiles = result.summary.filter((s) => s.rows > 0);
      const emptyFiles = result.summary.filter((s) => s.rows === 0);
      const message =
        `${result.totalRows} rows parsed from ${parsedFiles.length} of ` +
        `${result.summary.length} file(s).` +
        (emptyFiles.length > 0
          ? ` ${emptyFiles.length} file(s) had no recognizable data and were skipped.`
          : "");
      setStatus({ kind: "success", message, summary: result.summary });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "The Excel files could not be parsed.",
      });
    }
  };

  const handleClear = async () => {
    clearClientExcelOverrides();
    setHasOverride(false);
    resetForm();
    await queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isBusy) return;
        setOpen(nextOpen);
        if (!nextOpen && status.kind !== "success") resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/10 text-white shadow-none hover:bg-white/20 hover:text-white"
        >
          <Upload className="h-4 w-4" />
          Upload Excel
          {hasOverride && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Upload Excel
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="dashboard-excel-file">Excel files</Label>
            <Input
              ref={fileInputRef}
              id="dashboard-excel-file"
              type="file"
              multiple
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="h-11 cursor-pointer py-2 file:mr-3 file:cursor-pointer"
              disabled={isBusy}
              onChange={(event) => {
                setSelectedFiles(Array.from(event.target.files ?? []));
                setStatus({ kind: "idle" });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Select any of: RAG, Program Overview, Joint Workstream Checklist, Risk Log, Decision
              Log. Files you leave out keep their current data.
            </p>
          </div>

          {selectedFiles.length > 0 && status.kind !== "success" && (
            <ul className="grid gap-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              {selectedFiles.map((file) => (
                <li key={file.name} className="flex items-center gap-2 text-foreground/80">
                  <FileSpreadsheet className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate">{file.name}</span>
                </li>
              ))}
            </ul>
          )}

          {status.kind === "success" && (
            <ul className="grid gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm">
              {status.summary.map((file) => (
                <li key={file.fileName} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    {file.rows > 0 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    )}
                    <span className="truncate text-emerald-900">{file.fileName}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-xs font-medium text-emerald-700">
                    {file.rows > 0 ? `${file.label} · ${file.rows} rows` : "not recognized"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {status.kind !== "idle" && (
            <div
              className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm ${
                status.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : status.kind === "error"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
              role="status"
              aria-live="polite"
            >
              {status.kind === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : status.kind === "error" ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
          <div>
            {hasOverride && (
              <Button type="button" variant="ghost" onClick={handleClear} disabled={isBusy}>
                Restore default data
              </Button>
            )}
          </div>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
