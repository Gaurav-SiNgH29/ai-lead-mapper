// Centralized constants for the backend — no magic numbers or strings
// scattered across modules. Every value that could change (model name,
// batch size, file limits, error messages) lives here and is imported
// by name, making the intent clear and changes safe.

// AI model configuration
export const GEMINI_MODEL = "gemini-2.5-flash-lite";
export const BATCH_SIZE = 25;
export const MAX_RETRIES = 2;
export const RETRY_DELAY_MS = 2000;
export const OPENAI_MODEL = "llama-3.3-70b-versatile";
export const BASE_URL = "https://api.groq.com/openai/v1";
export const OPENAI_MAX_TOKENS = 4096;

export const THINKING_BUDGET = 0; // Disabled — mapping is pattern-matching,
                                  // not deep reasoning; budget=0 saves latency

// File upload constraints — must match frontend's MAX_FILE_SIZE_BYTES
// in UploadDropzone.jsx exactly. If changed here, update there too.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_MIME_TYPE = "text/csv";
export const ACCEPTED_EXTENSION = ".csv";

// API route paths — single source of truth so a route rename never
// requires hunting through multiple files.
export const ROUTES = {
  health: "/health",
  import: "/api/import",
};

// Skip/failure reason strings — surfaced to the frontend in the skipped
// array, so keeping them here makes them easy to find and update.
export const SKIP_REASONS = {
  noContact: "No email or mobile number found",
  aiFailure: "AI processing failed after retries",
  duplicate: "Duplicate record (same email/mobile as an earlier row)",
};

// Server-side error messages returned in API responses.
// Kept here so tone is consistent and strings are never typed inline.
export const ERROR_MESSAGES = {
  noFileUploaded: "No file uploaded. Send a CSV under the field name 'file'.",
  notACsv: "Uploaded file is not a CSV.",
  emptyCsv: "Uploaded CSV is empty.",
  processingFailed: "An unexpected error occurred while processing your file. Retry",
  batchFailed: (attempt) => `Batch attempt ${attempt} failed`,
  batchPermanentlyFailed: "Batch permanently failed after retries",
};

// Server-side log messages — centralized so log output is consistent
// and searchable. Never used for user-facing responses.
export const LOG_MESSAGES = {
  serverRunning: (port) => `[server] Running on http://localhost:${port}`,
  csvParseWarnings: "[server] CSV parse warnings:",
  importError: "[server] Error processing import:",
  batchAttemptFailed: (attempt) => `[aiMapper] Batch attempt ${attempt + 1} failed:`,
  batchPermanentlyFailed: "[aiMapper] Batch permanently failed after retries:",
};