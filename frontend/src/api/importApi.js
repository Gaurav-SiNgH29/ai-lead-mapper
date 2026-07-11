import { IMPORT_ENDPOINT } from "@/constants/apiEndpoints";

export async function importCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(IMPORT_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || "Import request failed.");
  }

  return response.json();
}