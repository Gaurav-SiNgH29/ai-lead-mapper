"use client";

import { useState } from "react";
import Papa from "papaparse";
import UploadDropzone from "@/components/UploadDropzone";
import PreviewTable from "@/components/PreviewTable";
import ResultsTable from "@/components/ResultsTable";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import FileChip from "@/components/ui/FileChip";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { MESSAGES } from "@/constants/messages";
import { THEME } from "@/constants/theme";
import { importCsv } from "@/api/importApi";

// Step labels pulled from MESSAGES — no hardcoded strings in this file.
// Defined outside the component so the array reference is stable across
// renders and never triggers unnecessary re-renders.
const STEPS = [
  MESSAGES.stepUpload,
  MESSAGES.stepPreview,
  MESSAGES.stepConfirm,
  MESSAGES.stepResults,
];

// Page-level state machine: currentStep drives which screen is shown.
// 0 = Upload, 1 = Preview, 2 = Confirm (loading), 3 = Results
export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [parsedColumns, setParsedColumns] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Client-side CSV parse for preview only — no backend call yet,
  // matching the spec's requirement that AI processing happens only
  // after explicit user confirmation in Step 3.
  function handleFileAccepted(selectedFile, error) {
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);
    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields;

        if (!fields || fields.length === 0) {
          setUploadError(MESSAGES.errorEmptyCsv);
          return;
        }

        // Guard against non-CSV content that technically "parses" —
        // a real CSV header row should never contain brace characters.
        const looksLikeJson = fields.some(
          (f) => f.includes("{") || f.includes("}")
        );
        if (looksLikeJson) {
          setUploadError(MESSAGES.errorNotCsv);
          return;
        }

        setParsedColumns(fields);
        setParsedRows(results.data);
        setCurrentStep(1);
      },
      error: () => {
        setUploadError(MESSAGES.errorGeneric);
      },
    });
  }

  // Discards the selected file and returns to Upload — does NOT clear
  // importResult, so a previous successful import remains visible if
  // the user navigates back before starting a new import.
  function handleDiscardFile() {
    setFile(null);
    setParsedColumns([]);
    setParsedRows([]);
    setImportError(null);
    setUploadError(null);
    setCurrentStep(0);
  }

  // Sends the confirmed file to the backend for AI mapping.
  // Confirm button is disabled while importing to prevent double-submit.
  async function handleConfirm() {
    if (!file) {
      setImportError(MESSAGES.errorNoFile);
      return;
    }

    setImportError(null);
    setIsImporting(true);
    setCurrentStep(2);

    try {
      const result = await importCsv(file);
      setImportResult(result);
      setCurrentStep(3);
    } catch (err) {
      setImportError(err.message || MESSAGES.errorGeneric);
      // Return to Preview so the user can retry without re-uploading.
      setCurrentStep(1);
    } finally {
      setIsImporting(false);
    }
  }

  // Full reset — clears all state and returns to the Upload screen.
  // Distinct from handleDiscardFile (which preserves importResult).
  function handleStartOver() {
    setFile(null);
    setParsedColumns([]);
    setParsedRows([]);
    setImportResult(null);
    setImportError(null);
    setUploadError(null);
    setCurrentStep(0);
  }

  return (
    <main className={`min-h-screen ${THEME.pageBg} ${THEME.textPrimary}`}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        <header className="mb-10 flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${THEME.textPrimary}`}>
              {MESSAGES.appTitle}
            </h1>
            <p className={`mt-1 text-sm ${THEME.textSecondary}`}>
              {MESSAGES.appSubtitle}
            </p>
          </div>
          <ThemeToggle />
        </header>

        <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  i === currentStep
                    ? "bg-orange-500 text-white"
                    : i < currentStep
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                    : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={
                  i === currentStep
                    ? `font-medium ${THEME.textPrimary}`
                    : THEME.textMuted
                }
              >
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-1 h-px w-6 sm:mx-2 sm:w-8 ${THEME.border}`}
                />
              )}
            </li>
          ))}
        </ol>

        <div
          className={`rounded-2xl border p-4 shadow-sm sm:p-8 ${THEME.cardBorder} ${THEME.cardBg}`}
        >
          {currentStep === 0 && (
            <UploadDropzone
              onFileAccepted={handleFileAccepted}
              error={uploadError}
            />
          )}

          {currentStep === 1 && (
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className={`text-lg font-medium ${THEME.textPrimary}`}>
                    {MESSAGES.previewTitle}
                  </h2>
                  <p className={`text-sm ${THEME.textSecondary}`}>
                    {MESSAGES.previewSubtitle}
                  </p>
                </div>
                <Button onClick={handleConfirm} disabled={isImporting}>
                  {MESSAGES.confirmButton}
                </Button>
              </div>

              <div className="mb-4">
                <FileChip file={file} onRemove={handleDiscardFile} />
              </div>

              {importError && (
                <p className={`mb-4 text-sm ${THEME.errorText}`} role="alert">
                  {importError}
                </p>
              )}

              <PreviewTable columns={parsedColumns} rows={parsedRows} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <Spinner />
              <div className="text-center">
                <p className={`font-medium ${THEME.textPrimary}`}>
                  {MESSAGES.loadingTitle}
                </p>
                <p className={`text-sm ${THEME.textSecondary}`}>
                  {MESSAGES.loadingSubtitle}
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && importResult && (
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className={`text-lg font-medium ${THEME.textPrimary}`}>
                  {MESSAGES.resultsTitle}
                </h2>
                <Button variant="secondary" onClick={handleStartOver}>
                  {MESSAGES.startOverButton}
                </Button>
              </div>

              <div className="mb-6">
                <FileChip file={file} />
              </div>

              <ResultsTable
                imported={importResult.imported}
                skipped={importResult.skipped}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}