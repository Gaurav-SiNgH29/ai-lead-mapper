// Centralized backend URL config. If the backend URL ever changes
// (e.g. moving from localhost to a deployed Render URL), this is the
// only file that needs to change.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Warn loudly in production if the env var is missing — a silent
// fallback to localhost would fail cryptically for every end user
// rather than surfacing a clear misconfiguration at deploy time.
if (!BASE_URL && process.env.NODE_ENV === "production") {
  console.error(
    "[groweasy] NEXT_PUBLIC_API_BASE_URL is not set. " +
      "All API calls will fail. Set this variable in your deployment environment."
  );
}

export const API_BASE_URL = BASE_URL || "http://localhost:4000";

export const API_ENDPOINTS = {
  // The single import/extraction endpoint — accepts a CSV file (multipart/form-data)
  // and returns { imported, skipped, totalImported, totalSkipped }
  import: `${API_BASE_URL}/api/import`,

  // Health check — used to verify the backend is reachable before
  // showing the user a confusing "Failed to fetch" error
  health: `${API_BASE_URL}/health`,
};