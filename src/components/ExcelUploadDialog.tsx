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
  applyClientExcelOverride,
  clearClientExcelOverrides,
  hasClientExcelOverrides,
  mergeClientExcelData,
} from "@/lib/client-excel-upload";
import { parseUploadedDashboardExcel } from "@/lib/upload-server-fn";

type UploadStatus =
  | { kind: "idle" }
  | { kind: "reading"; message: string }
  | { kind: "processing"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("The selected file could not be read."));
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ kind: "idle" });
  const [hasOverride, setHasOverride] = useState(hasClientExcelOverrides());
  const isBusy = status.kind === "reading" || status.kind === "processing";

  const resetForm = () => {
    setSelectedFile(null);
    setStatus({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus({ kind: "error", message: "Choose an Excel file before submitting." });
      return;
    }

    try {
      setStatus({ kind: "reading", message: "Reading the Excel file…" });
      const data = await readFileAsBase64(selectedFile);

      setStatus({
        kind: "processing",
        message: "Uploaded. The backend is parsing all dashboard sheets…",
      });
      const result = await parseUploadedDashboardExcel({
        data: { fileName: selectedFile.name, data },
      });

      applyClientExcelOverride(result.data);
      queryClient.setQueryData<DashboardResponse>(["dashboard-data"], (current) =>
        current ? mergeClientExcelData(current) : current,
      );
      setHasOverride(true);
      setStatus({
        kind: "success",
        message: `${result.totalRows} rows parsed successfully across ${result.moduleCount} of 5 modules.`,
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "The Excel file could not be parsed.",
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

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Upload Excel
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="dashboard-excel-file">Excel file</Label>
            <Input
              ref={fileInputRef}
              id="dashboard-excel-file"
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="h-11 cursor-pointer py-2 file:mr-3 file:cursor-pointer"
              disabled={isBusy}
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
                setStatus({ kind: "idle" });
              }}
            />
          </div>

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
                Restore backend data
              </Button>
            )}
          </div>
          <Button type="button" onClick={handleUpload} disabled={!selectedFile || isBusy}>
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
