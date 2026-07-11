'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import UploadDropzone from '@/components/UploadDropzone';
import PreviewTable from '@/components/PreviewTable';
import ResultsTable from '@/components/ResultsTable';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import FileChip from '@/components/ui/FileChip';
import { MESSAGES } from '@/constants/messages';
import { importCsv } from '@/api/importApi';

const STEPS = ['Upload', 'Preview', 'Confirm', 'Results'];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [parsedColumns, setParsedColumns] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);

  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Simulated progress percentage shown during AI processing. This does
  // not reflect real backend batch completion — it climbs steadily while
  // the request is in flight, then completes once the response arrives.
  // Chosen over real streaming progress for reliability given the
  // backend/dev-server response buffering issues encountered with NDJSON.

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

        const looksLikeJson = fields.some(
          (f) => f.includes('{') || f.includes('}'),
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

  // Discards the currently selected file and returns to the upload screen,
  // without losing any other app state (e.g. previous import results).
  function handleDiscardFile() {
    setFile(null);
    setParsedColumns([]);
    setParsedRows([]);
    setImportError(null);
    setUploadError(null);
    setCurrentStep(0);
  }

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
    setCurrentStep(1);
  } finally {
    setIsImporting(false);
  }
}

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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            GrowEasy CSV Importer
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload any lead export — we&apos;ll map it to your CRM
            automatically.
          </p>
        </header>

        <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  i === currentStep
                    ? 'bg-orange-500 text-white'
                    : i < currentStep
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-slate-200 text-slate-400'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={
                  i === currentStep
                    ? 'font-medium text-slate-900'
                    : 'text-slate-400'
                }
              >
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 h-px w-6 bg-slate-200 sm:mx-2 sm:w-8" />
              )}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
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
                  <h2 className="text-lg font-medium text-slate-900">
                    {MESSAGES.previewTitle}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {MESSAGES.previewSubtitle}
                  </p>
                </div>
                <Button onClick={handleConfirm}>
                  {MESSAGES.confirmButton}
                </Button>
              </div>

              <div className="mb-4">
                <FileChip file={file} onRemove={handleDiscardFile} />
              </div>

              {importError && (
                <p className="mb-4 text-sm text-red-600" role="alert">
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
                <p className="font-medium text-slate-900">{MESSAGES.loadingTitle}</p>
                <p className="text-sm text-slate-500">{MESSAGES.loadingSubtitle}</p>
              </div>
            </div>
          )}

          {currentStep === 3 && importResult && (
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-medium text-slate-900">
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