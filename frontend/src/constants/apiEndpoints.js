// Centralized backend URL config. If the backend URL ever changes
// (e.g. moving from localhost to a deployed Render URL), this is the
// only file that needs to change.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export const IMPORT_ENDPOINT = `${API_BASE_URL}/api/import`;