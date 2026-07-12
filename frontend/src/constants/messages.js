// All user-facing copy lives here — never typed inline in components.
// Keeps tone consistent, makes copy easy to find/update in one place,
// and ensures screen readers get the same strings as visible UI text.
export const MESSAGES = {
  // App header
  appTitle: "GrowEasy CSV Importer",
  appSubtitle: "Upload any lead export — we'll map it to your CRM automatically.",

  // Step indicator labels
  stepUpload: "Upload",
  stepPreview: "Preview",
  stepConfirm: "Confirm",
  stepResults: "Results",

  // Upload step
  uploadTitle: "Upload your CSV",
  uploadSubtitle: "Drag and drop a file here, or click to browse",
  uploadHint:
    "Works with any column layout — Facebook, Google Ads, CRM exports, and more (.csv, max 5MB)",
  uploadAriaLabel: "CSV file upload area",

  // Preview step
  previewTitle: "Preview",
  previewSubtitle: "Check your data before importing",
  confirmButton: "Confirm and import",

  // Loading / confirm step
  loadingTitle: "Mapping your leads\u2026",
  loadingSubtitle: "Our AI is matching your columns to CRM fields",

  // Results step
  resultsTitle: "Import complete",
  importedLabel: "Imported",
  skippedLabel: "Skipped",
  importedRecordsLabel: "Imported records",
  skippedRecordsLabel: "Skipped records",
  importedEmptyState: "No records were imported.",
  skippedEmptyState: "No records were skipped.",
  reasonColumnLabel: "Reason",
  recordDetailsColumnLabel: "Record details",

  // File chip
  removeFile: "Remove",
  removeFileAriaLabel: "Remove selected file",
  selectedFileLabel: "Selected file",

  // Theme toggle
  toggleDarkMode: "Switch to dark mode",
  toggleLightMode: "Switch to light mode",

  // Actions
  startOverButton: "Import another file",

  // Errors — ordered from most to least likely to be seen
  errorGeneric: "Something went wrong. Please try again.",
  errorNoFile: "Please select a CSV file first.",
  errorNotCsv: "That file doesn\u2019t look like a CSV. Please upload a .csv file.",
  errorEmptyCsv: "This CSV file appears to be empty.",
  errorFileTooLarge: "File is too large. Maximum size is 5MB.",
  errorNetworkFailure:
    "Could not reach the server. Please check your connection and try again.",
  errorImportFailed: (status) =>
    `Import failed (status ${status}). Please try again.`,
  errorUnexpectedResponse:
    "The server returned an unexpected response. Please try again.",
};